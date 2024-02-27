const express = require("express");
const mysql = require("mysql2");

const app = express();

// ordinarily this information would be in a .env or hidden config file, for the purposes of demo simplicity and to avoid an additional package requirement for dotenv the information is in this file
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "letmein123",
    database: "rest-test",
});

db.connect((err) => {
    if (err) {
        console.error("Cannot connect to database, threw error:", err.stack);
    } else {
        console.log("Connected to database.");
    }
});

app.use(express.json());

app.post("/register", (req, res) => {
    const { first_name, last_name, email, password } = req.body;

    if (!first_name || !last_name || !email || !password) {
        res.status(400).json({ error: 'Registration requires an email address, password, first name, and last name.' });
        return;
    }

    db.query("INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)", 
    [first_name, last_name, email, password],
    (err, results) => {
        if (err) {
            res.status(500).json({ error: `Could not complete the request: ${err.sqlMessage}` });
        } else {
            const registerSuccess = {
                user_id: results.insertId,
                email,
                first_name,
                last_name,
                success_message: `Account for ${email} successfully registered!`
            };
            res.json(registerSuccess);
        }
    });
});

app.listen(3000, () => {
    console.log(`Server running on port 3000.`);
});