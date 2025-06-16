const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

const db = new sqlite3.Database(path.join(__dirname, '../Database/momo.db'));

app.get('/transactions', (req, res) => {
  db.all('SELECT * FROM transactions ORDER BY date DESC', [], (err, rows) => {
    if (err) return res.status(500).send(err.message);
    res.json(rows);
  });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
