const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const { sequelize } = require('./models');

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

app.listen(PORT, async () => {
  try {
    await sequelize.authenticate();
    console.log('DB connected successfully!');
    console.log(`Server is running on http://localhost:${PORT}`);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
});
