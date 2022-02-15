CREATE DATABASE weight_logs_database;

CREATE TABLE users(
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE weight_logs(
    weight_log_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    weight DECIMAL(5,2),
    date VARCHAR(344),

    FOREIGN KEY (user_id) REFERENCES users(user_id)
);