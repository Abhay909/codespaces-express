const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User'); // Adjust path as needed
const dotenv = require('dotenv');
dotenv.config();
require('dotenv').config();


const JWT_SECRET = process.env.JWT_SECRET || 'secret_jwt_key';
const CAPTCHA_SECRET = process.env.CAPTCHA_SECRET || 'secret_captcha_key'; // Simulated

// ✅ Helper: Simulated CAPTCHA
function validateCaptcha(input) {
  return input === CAPTCHA_SECRET;
}

// ✅ Helper: Simulated email verification link
function sendVerificationEmail(email) {
  console.log(`Simulated email: Verify your account at http://localhost:3000/verify/${email}`);
}

// ✅ Helper: Simulated password reset link
function sendResetLink(email) {
  console.log(`Simulated reset: Reset your password at http://localhost:3000/reset/${email}`);
}

// ✅ POST /signup
router.post('/signup', async (req, res) => {
  const { email, password, captcha } = req.body;

  if (!email || !password || !captcha) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  if (!validateCaptcha(captcha)) {
    return res.status(403).json({ error: 'Invalid CAPTCHA' });
  }

  const userExists = await User.findOne({ email });
  if (userExists) return res.status(409).json({ error: 'Email already registered' });

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    email,
    password: hashedPassword,
    isVerified: false
  });

  await user.save();
  sendVerificationEmail(email);
  res.status(201).json({ message: 'Signup successful. Check email to verify.' });
});

// ✅ GET /verify/:email (simulated)
router.get('/verify/:email', async (req, res) => {
  const user = await User.findOne({ email: req.params.email });
  if (!user) return res.status(404).json({ error: 'User not found' });

  user.isVerified = true;
  await user.save();
  res.json({ message: 'Email verified successfully!' });
});

// ✅ POST /login
router.post('/login', async (req, res) => {
  const { email, password, captcha } = req.body;

  if (!email || !password || !captcha) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  if (!validateCaptcha(captcha)) {
    return res.status(403).json({ error: 'Invalid CAPTCHA' });
  }

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ error: 'Incorrect password' });

  if (!user.isVerified) return res.status(403).json({ error: 'Email not verified' });

  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });

  res.json({ message: 'Login successful', token });
});

// ✅ POST /forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: 'User not found' });

  sendResetLink(email);
  res.json({ message: 'Password reset link sent to email (simulated)' });
});

// ✅ POST /reset-password/:email
router.post('/reset-password/:email', async (req, res) => {
  const { newPassword } = req.body;

  if (!newPassword) return res.status(400).json({ error: 'Missing password' });

  const user = await User.findOne({ email: req.params.email });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();

  res.json({ message: 'Password reset successful' });
});

module.exports = router;
