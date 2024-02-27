const express = require("express");
const mysql = require("mysql2");

const app = express();

// ordinarily this information would be in a .env or hidden config file, for the purposes of demo simplicity and to avoid an additional package requirement for dotenv the information is in this file
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "letmein123",
    database: "giftogram-test",
});

db.connect((err) => {
    if (err) {
        console.error("Cannot connect to database, threw error:", err.stack);
    } else {
        console.log("Connected to database.");
    }
});

app.use(express.json());

app.listen(3000, () => {
    console.log(`Server running on port 3000.`);
});