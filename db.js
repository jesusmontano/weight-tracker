const Pool = require("pg").Pool;

const pool = new Pool({
    user: "jesusmontano",
    password: "",
    database: "weight_logs_database",
    host: "localhost",
    port: 5432
});

module.exports = pool;