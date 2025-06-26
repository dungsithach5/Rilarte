const express = require('express');
const router = require('./routes/index');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = 5000;

const corsOptions = {
  origin: 'http://localhost:3000', 
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


router(app);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!' 
  });
});

app.listen(PORT, () => {
  console.log(` Server is running on http://localhost:${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(` CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
});