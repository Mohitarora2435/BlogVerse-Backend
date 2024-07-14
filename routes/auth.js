const express = require('express');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const router = express.Router();
var jwt = require('jsonwebtoken');
require('dotenv').config();
const fetchuser = require('../middleware/fetchuser')

const JWTSecret = process.env.secret;


// Create user with help of username email and password
router.post('/createuser', [
    body('username', 'Username must have 3 characters').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must have 5 characters').isLength({ min: 5 }),
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // Check if user with the same username or email already exists
    const existingUser = await User.findOne({ $or: [{ username: req.body.username }, { email: req.body.email }] });
    if (existingUser) {
        return res.status(400).json({ error: 'Username or email already exists' });
    }
    // Generating a salt and Hashing the password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Using jwt for security of my website
    const data = {
        user: {
            id: User.id
        }
    }
    var token = jwt.sign(data, JWTSecret);

    // Create the user
    User.create({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword, // Save hashed password
    }).then(user => res.json({token}))
        .catch(err => res.status(500).json({ error: 'Error creating user' }));
});

// Creating an end point for user to login using email and password
router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password cannot be empty').exists(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const passwordCompare = await bcrypt.compare(password, existingUser.password);
        if (!passwordCompare) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const data = {
            user: {
                id: existingUser.id
            }
        }
        const token = jwt.sign(data, JWTSecret);
        res.json({token});
    } catch (error) {
        console.error('Error finding user:', error);
        res.status(500).json({ error: 'Error finding user' });
    }
});

//geting details of user from the jwt token
router.post('/getuser', fetchuser, async (req, res) => {
    try {
       const userId = req.user.id;
       const user = await User.findById(userId).select("-password")
       res.send(user)
    } catch (error) {
        console.error('Error finding user:', error);
        res.status(500).json({ error: 'Error finding user' });
    }
})


module.exports = router;
