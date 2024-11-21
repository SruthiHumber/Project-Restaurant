const jwt = require('jsonwebtoken');
const crypto = require('crypto');
require('dotenv').config(); 

function generateJwtSecret() {
    const secret = crypto.randomBytes(64).toString('hex'); // Generate a 64-byte hex secret
    console.log("jwtsercret", secret)
    process.env.JWT_SECRET = secret;
  }
 // Generate a new secret and assign it to the environment variable

const generateToken = async (user) => {
    await generateJwtSecret(); 
    console.log("jwtsercretEnv1", process.env.JWT_SECRET)

    return jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
};

module.exports = { generateToken };
