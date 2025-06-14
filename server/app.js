const express = require('express');
const router = require('./routes/index');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = 3000;


// Middleware
app.use(cors());
app.use(express.json());
// Routes
router(app)

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});