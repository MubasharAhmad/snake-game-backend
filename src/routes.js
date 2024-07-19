const express = require('express');
const db = require('./db');
const router = express.Router();

// Create the users table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    highscore INTEGER
)`);

// Get a single user by username
router.get('/users/:username', (req, res) => {
    const { username } = req.params;
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) {
            res.status(400).json({ success: false });
            return;
        }
        if (!row) {
            // create user
            db.run('INSERT INTO users (username, highscore) VALUES (?, ?)', [username, 0]);
        }
        res.json({ user: row, success: true });
    });
});

// Create or update a user's high score
router.post('/users', (req, res) => {
    const { username, score } = req.body;

    db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }

        if (row) {
            // If user exists, update the high score if the new score is higher
            if (score > row.highscore) {
                db.run('UPDATE users SET highscore = ? WHERE username = ?', [score, username], function (err) {
                    if (err) {
                        res.status(400).json({ error: err.message });
                        return;
                    }
                    res.json({ message: 'High score updated successfully', changes: this.changes });
                });
            } else {
                res.json({ message: 'Score is not higher than current high score' });
            }
        } else {
            // If user doesn't exist, create a new record
            db.run('INSERT INTO users (username, highscore) VALUES (?, ?)', [username, score], function (err) {
                if (err) {
                    res.status(400).json({ error: err.message });
                    return;
                }
                res.json({ message: 'User created successfully', user: { id: this.lastID, username, highscore: score } });
            });
        }
    });
});

// Get the top 10 users by high score
router.get('/leaderboard', (req, res) => {
    db.all('SELECT username, highscore FROM users ORDER BY highscore DESC LIMIT 10', [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ leaderboard: rows });
    });
});

module.exports = router;
