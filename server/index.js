const express = require('express');
const cors = require('cors');
const db = require('./database/db'); 
require('dotenv').config();


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); 
app.use(express.json()); 

app.get('/', (req, res) => {
  res.send('Backend Node.js đang hoạt động!');
});

app.get('/api/users', (req, res) => {
  const sql = 'SELECT * FROM users';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Lỗi SQL:', err);
      return res.status(500).json({ error: 'Lỗi truy vấn dữ liệu' });
    }
    res.status(200).json(results);
  });
});

app.listen(PORT, () => {
  console.log(`backend http://localhost:${PORT}`);
});
