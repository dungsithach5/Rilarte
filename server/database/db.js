const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'social_media',
});

db.connect(err => {
  if (err) {
    console.error('Kết nối MySQL thất bại:', err);
  } else {
    console.log('Đã kết nối MySQL!');
  }
});

module.exports = db;
