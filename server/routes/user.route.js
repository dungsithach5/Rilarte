const express = require('express');
const router = express.Router();
const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
} = require('../controllers/user.controller');

router
    .route('/')
    .get(getAllUsers)
    .post(createUser);

router
    .route('/:id')
    .get(getUserById)
    .put(updateUser)
    .delete(deleteUser);


router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Tìm user
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: 'Email không tồn tại' });

    // So sánh mật khẩu
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: 'Sai mật khẩu' });

    // Tạo token
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'my-secret-key', { expiresIn: '1h' });

    // Gửi token về client
    res.json({ token, name: user.name });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

router.post('/register', async (req, res) => {
  const { email, name, password } = req.body;

  try {
    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }

    const user = await User.create({ email, name, password });

    res.status(201).json({ message: 'User created', user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', err });
  }
});

module.exports = router;