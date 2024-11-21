const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/users');
const { generateToken } = require('../utils/jwt');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

// Register User
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }
        console.log(password);
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        console.log(hashedPassword)
        const isMatch = await bcrypt.compare(password, hashedPassword);
        console.log('Password Match:', isMatch); 
        const user = new User({
            username,
            email,
            password: hashedPassword
        });
        
        await user.save();
        // Render the success page after successful registration
        res.status(201).render('registrationSuccess', { username });
    } catch (err) {
        res.status(500).json({ error: 'User registration failed' });
    }
});

// Login User
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Find user by username
        const user = await User.findOne({ username });
        console.log(user.username)
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        // Compare password
        const isMatch = await bcrypt.compare(password.trim(), user.password.trim());
                console.log(user.password)
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        // Generate JWT token
        const token = generateToken(user);

        // Set JWT token in cookie
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

        
        // Render restaurant page
        res.status(201).render('form', { username: user.username});
    } catch (err) {
        res.status(500).json({ error: 'Login failed' });
    }
});

// Protected Route Example
router.get('/protected', authMiddleware, (req, res) => {
    res.json({ message: `Hello, ${req.user.username}! This is a protected route.` });
});

module.exports = router;
