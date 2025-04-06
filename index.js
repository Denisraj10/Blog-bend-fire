const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'blog_app',
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL');
});

// Signup Route (New)
app.post('/signup', (req, res) => {
  const { email, password } = req.body;
  // Check if user already exists
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, result) => {
    if (err) throw err;
    if (result.length > 0) return res.status(400).json({ msg: 'Email already exists' });

    // Insert new user (plain text password for simplicity)
    db.query(
      'INSERT INTO users (email, password) VALUES (?, ?)',
      [email, password],
      (err, result) => {
        if (err) throw err;
        res.json({ msg: 'Sign up successful! Please log in.' });
      }
    );
  });
});

// Login Route
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, result) => {
    if (err) throw err;
    if (result.length === 0) return res.status(400).json({ msg: 'User not found' });

    const user = result[0];
    if (password !== user.password) return res.status(400).json({ msg: 'Invalid password' });

    const token = jwt.sign({ email: user.email }, 'secret_key', { expiresIn: '1h' });
    res.json({ token });
  });
});

// Create Blog
app.post('/blogs', (req, res) => {
  const { title, content, user_email } = req.body;
  db.query(
    'INSERT INTO blogs (title, content, user_email) VALUES (?, ?, ?)',
    [title, content, user_email],
    (err, result) => {
      if (err) throw err;
      res.json({ msg: 'Blog posted successfully' });
    }
  );
});

// Get All Blogs
app.get('/blogs', (req, res) => {
  db.query('SELECT * FROM blogs ORDER BY created_at DESC', (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});