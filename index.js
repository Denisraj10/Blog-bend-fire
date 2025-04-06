require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));


// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const User = mongoose.model('User', userSchema);

// Blog Schema
const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  user_email: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});
const Blog = mongoose.model('Blog', blogSchema);

// Signup Route
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: 'Email already exists' });

    const newUser = new User({ email, password }); // Plain text password for simplicity
    await newUser.save();
    res.json({ msg: 'Sign up successful! Please log in.' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Login Route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'User not found' });

    if (password !== user.password) return res.status(400).json({ msg: 'Invalid password' });

    const token = jwt.sign({ email: user.email }, 'secret_key', { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Create Blog
app.post('/blogs', async (req, res) => {
  const { title, content, user_email } = req.body;
  try {
    const newBlog = new Blog({ title, content, user_email });
    await newBlog.save();
    res.json({ msg: 'Blog posted successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get All Blogs
app.get('/blogs', async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ created_at: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


module.exports = app;