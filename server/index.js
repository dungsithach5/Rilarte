const express = require('express');
const cors = require('cors');
const db = require('./database/db');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend Node.js đang hoạt động!');
});

app.get('/api/users', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) {
      console.error('Lỗi SQL:', err);
      return res.status(500).json({ error: err });
    }
    res.json(results);
  });
});

app.listen(PORT, () => {
  console.log(`Server backend chạy tại http://localhost:${PORT}`);
});
