require('dotenv').config();
const express = require('express');
const path = require('path');
const axios = require('axios');
const admin = require('./firebaseAdmin');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const CAPTCHA_SECRET = process.env.CAPTCHA_SECRET_KEY;

async function verifyCaptcha(token) {
  const url = `https://www.google.com/recaptcha/api/siteverify?secret=${CAPTCHA_SECRET}&response=${token}`;
  const response = await axios.post(url);
  return response.data.success;
}

app.post('/api/signup', async (req, res) => {
  const { email, password, 'g-recaptcha-response': captchaToken } = req.body;

  if (!email || !password || !captchaToken) {
    return res.status(400).json({ error: 'Missing fields or CAPTCHA' });
  }

  try {
    const captchaSuccess = await verifyCaptcha(captchaToken);
    if (!captchaSuccess) return res.status(400).json({ error: 'CAPTCHA verification failed' });

    // Create user with Firebase Admin SDK
    const userRecord = await admin.auth().createUser({ email, password });
    res.status(201).json({ message: 'Signup successful' });
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      return res.status(409).json({ error: 'Email already registered' });
    }
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Serve frontend files
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'signup.html')));
app.get('/login.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/signup.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'signup.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
