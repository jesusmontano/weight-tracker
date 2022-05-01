const express = require("express");
const app = express();
const pool = require("./db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("./keys");
const passport = require("passport");
const passportHelpers = require("./passportHelpers");
const validations = require("./validations");
const validator = require("validator");
const cors = require("cors");

require("./passport")(passport);
app.use(passport.initialize());

app.use(express.json());

app.use(cors());

app.get("/logs", passportHelpers.authenticateJWT, async (req, res) => {
  const userId = req.user.user_id;

  try {
    const logs = await pool.query(
      "SELECT * FROM weight_logs WHERE user_id = $1",
      [userId]
    );
    res.json(logs.rows);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

app.post("/logs", passportHelpers.authenticateJWT, async (req, res) => {
  let { date, weight } = req.body;
  const userId = req.user.user_id;

  date = validator.toDate(date);

  if (!date) return res.status(400).send("Date format is invalid.");

  if (!validations.validateDate(date).isValid) {
    res.status(400).send(validations.validateDate(date).errors);
  }

  date = date.toISOString().slice(0, 10);

  try {
    const result = await pool.query(
      "SELECT * FROM weight_logs WHERE date = $1 AND user_id = $2",
      [date, userId]
    );

    if (result.rows.length) {
      return res.status(403).send("Entry already exists for this date");
    }

    const newLog = await pool.query(
      "INSERT INTO weight_logs (weight, date, user_id) VALUES ($1, $2, $3) RETURNING *",
      [weight, date, userId]
    );
    res.json(newLog.rows[0]);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

app.put("/logs/:id", passportHelpers.authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.user_id;

  let { date, weight } = req.body;

  date = validator.toDate(date);

  if (!date) return res.status(400).send("Date format is invalid.");

  if (!validations.validateDate(date).isValid) {
    res.status(400).send(validations.validateDate(date).errors);
  }

  date = date.toISOString().slice(0, 10);

  try {
    const result = await pool.query(
      "SELECT * FROM weight_logs WHERE weight_log_id = $1",
      [id]
    );

    if (result.rows[0].user_id !== userId) return res.send(401);

    await pool.query(
      "UPDATE weight_logs SET weight = $1, date = $2 WHERE weight_log_id = $3",
      [weight, date, id]
    );
    res.send(200);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

app.delete("/logs/:id", passportHelpers.authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.user_id;

  try {
    const result = await pool.query(
      "SELECT * FROM weight_logs WHERE weight_log_id = $1",
      [id]
    );

    if (result.rows[0].user_id !== userId) return res.send(401);

    await pool.query("DELETE FROM weight_logs WHERE weight_log_id = $1", [id]);
    res.send(200);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!validations.validateEmail(email).isValid) {
    return res.status(400).send(validations.validateEmail(email).errors);
  }

  if (!validations.validatePassword(password).isValid) {
    return res.status(400).send(validations.validatePassword(password).errors);
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (result.rows.length > 0) {
      return res
        .status(404)
        .send("An account already exists for this email account.");
    } else {
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(password, salt);
      const newUser = await pool.query(
        "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
        [email, hash]
      );

      const payload = {
        user_id: newUser.rows[0].user_id,
        email: newUser.rows[0].email,
      };

      jwt.sign(
        payload,
        keys.secretOrKey,
        // Tell the key to expire in one hour
        { expiresIn: 3600 },
        (err, token) => {
          res.json({
            success: true,
            token: "Bearer " + token,
          });
        }
      );
    }
  } catch (e) {
    return res.status(500).send(e.message);
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (!result.rows.length)
      return res
        .status(404)
        .send("There is no account associated with that email.");
    const hash = result.rows[0].password;
    const isCorrect = bcrypt.compareSync(password, hash);

    if (isCorrect) {
      const payload = {
        user_id: result.rows[0].user_id,
        email: result.rows[0].email,
      };

      jwt.sign(
        payload,
        keys.secretOrKey,
        // Tell the key to expire in one hour
        { expiresIn: 3600 },
        (err, token) => {
          res.json({
            success: true,
            token: "Bearer " + token,
          });
        }
      );
    } else {
      res.status(400).send("The password is incorrect.");
    }
  } catch (e) {
    return res.status(500).send(e.message);
  }
});

app.listen(4000, () => {
  console.log("Server is listening on port 4000.");
});
