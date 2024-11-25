const jwt = require('jsonwebtoken');
const crypto = require('crypto');
require('dotenv').config(); 

const generateToken = async (user) => {
   return jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
};

module.exports = { generateToken };
