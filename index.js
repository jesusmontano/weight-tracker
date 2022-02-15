const express = require('express');
const res = require('express/lib/response');
const app = express();
const pool = require('./db');

app.use(express.json());

app.get('/logs', async (req, res) => {
    try {
        const logs = await pool.query("SELECT * FROM weight_logs");
        res.json(logs.rows);
    } catch(e) {
        console.error(e.message);
    }
})

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

app.put('/logs/:id', async (req, res) => {
    const { id } = req.params;

    let { date, weight } = req.body;

    date = new Date(date).toString();

    try {
        await pool.query("UPDATE weight_logs SET weight = $1, date = $2 WHERE weight_log_id = $3", 
        [weight, date, id]);
        res.send(200);
    } catch(e) {
        console.error(e.message);
    }
})

app.delete('/logs/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        await pool.query("DELETE FROM weight_logs WHERE weight_log_id = $1", [id]);
        res.send(200);
    } catch(e) {
        console.error(e.message)
    }
})

app.listen(3000, () => {
    console.log("Server is listening on port 3000.");
})