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

app.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ error: 'Please provide both a login and password.' });
        return;
    }

    db.query("SELECT * FROM users WHERE email = ? AND password = ?", 
    [email, password],
    (err, results) => {
        if (err) {
            res.status(500).json({ error: `Error serving request: ${err.message}` });
        } else {
            if(!results[0] || results[0] == []) {
                const loginFailure = {
                    error_code: "401",
                    error_title: "Login Unsuccessful",
                    error_message: "Sorry, this email & password combination is not registered. Please check the information you provided or register for an account."
                };
                res.json(loginFailure);
            } else {
                const { id, first_name, last_name } = results[0];
                const loginSuccess = {
                    id,
                    email,
                    first_name,
                    last_name,
                    success_message: "Logged in!"
                };
                res.json(loginSuccess);
            }
        }
    });
});

app.get("/list_all_users", (req, res) => {
    // could make this so if the requester is not a user it doesn't return anything as well depending on security concerns
    const id = req.body.requester_user_id;

    if (!id) {
        res.status(400).json({ error: 'Please provide your user ID to perform a lookup.' });
        return;
    }

    db.query("SELECT * FROM users WHERE id <> ?", 
    [id],
    (err, results) => {
        if(err) {
            res.status(500).json({ error: err.message });
        } else {
            res.send(results);
        }
    })
})

app.listen(3000, () => {
    console.log(`Server running on port 3000.`);
});