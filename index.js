const express = require('express');
const app = express();
const pool = require('./db');

app.use(express.json());

app.post('/logs', async (req, res) => {
    let { date, weight } = req.body;

    date = new Date(date).toString();

    try {
        const newLog = await pool.query("INSERT INTO weight_logs (weight, date) VALUES ($1, $2) RETURNING *", 
        [weight, date])
        res.json(newLog.rows[0]);
    } catch(e) {
        console.error(e.message);
    }
})

app.listen(3000, () => {
    console.log("Server is listening on port 3000.");
})