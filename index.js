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

app.post("/send_message", (req, res) => {
    const { sender, recipient, message } = req.body;

    if (!sender || !recipient || !message) {
        res.status(400).json({ error: "Messages require a sender, recipient, and body to be delivered. Please try again." });
        return;
    }

    const newMessage = { 
        sender_user_id: sender, 
        receiver_user_id: recipient,
        message,
        epoch: Math.floor(new Date().getTime() / 1000) 
    };

    db.query("INSERT INTO messages SET ?", newMessage, (err, results) => {
        if (err) {
            res.status(500).json({ error: `Error serving request: ${err.message}` });
        } else {
            /* rather than hardcoding the 200 success response, it seems more sensible to first check whether a row has been added to the table. If added return 200 for full success, if not return 204 to indicate that the request was technically successful but the database hasn't been updated */
            const successResponse = {
                success_code: results.affectedRows > 0 ? '200' : '204',
                success_title: "Message Sent",
                success_message: "Message was sent successfully!"
            };
            res.json(successResponse);
        }
    });
});

app.get('/view_messages', (req, res) => {
    const { user_id_a, user_id_b } = req.body;

    if (!user_id_a || !user_id_b) {
        res.status(400).json({ error: 'Both user IDs are required to view messages.' });
        return;
    }

    // this could also be ordered by message id depending on preference
    db.query(
        `
        SELECT message_id, sender_user_id, message, epoch
        FROM messages 
        WHERE (sender_user_id in(?, ?) AND receiver_user_id in(?, ?))
        ORDER BY epoch
        `,
        [user_id_a, user_id_b, user_id_b, user_id_a],
        (err, results) => {
            if (err) {
                res.status(500).json({ error: `Error serving request: ${err.message}` });
            } else {
                const formattedResponse = {
                    messages: results.map((message) => ({
                        message_id: message.message_id,
                        sender_user_id: message.sender_user_id,
                        message: message.message,
                        epoch: message.epoch
                    }))
                };
                if(!formattedResponse.messages || formattedResponse.messages.length == 0) {
                    res.send("No messages found.");
                } else {
                    res.json(formattedResponse);
                }
            }
        }
    );
});

app.listen(3000, () => {
    console.log(`Server running on port 3000.`);
});