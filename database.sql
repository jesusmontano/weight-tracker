CREATE DATABASE weight_logs_database;

CREATE TABLE weight_logs(
    weight_log_id SERIAL PRIMARY KEY,
    weight VARCHAR(255),
    date VARCHAR(344)
);