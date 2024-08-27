const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const port = 8000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let db = new sqlite3.Database('./db.sqlite3', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the SQLite database.');
});

app.route('/students')
    .get((req, res) => {
        const sql = 'SELECT * FROM students';
        db.all(sql, [], (err, rows) => {
            if (err) {
                res.status(400).json({ error: err.message });
                return;
            }
            res.json({ students: rows });
        });
    })
    .post((req, res) => {
        const { firstname, lastname, gender, age } = req.body;
        const sql = 'INSERT INTO students (firstname, lastname, gender, age) VALUES (?, ?, ?, ?)';
        const params = [firstname, lastname, gender, age];
        
        db.run(sql, params, function(err) {
            if (err) {
                res.status(400).json({ error: err.message });
                return;
            }
            res.json({ message: `Student with ID ${this.lastID} created successfully` });
        });
    });

app.route('/student/:id')
    .get((req, res) => {
        const sql = 'SELECT * FROM students WHERE id = ?';
        const params = [req.params.id];
        
        db.get(sql, params, (err, row) => {
            if (err) {
                res.status(400).json({ error: err.message });
                return;
            }
            res.json({ student: row });
        });
    })
    .put((req, res) => {
        const { firstname, lastname, gender, age } = req.body;
        const sql = 'UPDATE students SET firstname = ?, lastname = ?, gender = ?, age = ? WHERE id = ?';
        const params = [firstname, lastname, gender, age, req.params.id];
        
        db.run(sql, params, function(err) {
            if (err) {
                res.status(400).json({ error: err.message });
                return;
            }
            res.json({ message: `Student with ID ${req.params.id} updated successfully` });
        });
    })
    .delete((req, res) => {
        const sql = 'DELETE FROM students WHERE id = ?';
        const params = [req.params.id];
        
        db.run(sql, params, function(err) {
            if (err) {
                res.status(400).json({ error: err.message });
                return;
            }
            res.json({ message: `Student with ID ${req.params.id} deleted successfully` });
        });
    });

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Closed the database connection.');
        process.exit(0);
    });
});
