const jwt = require('jsonwebtoken');
const secret = process.env.SECRET_KEY;

function generateToken(payload, expiresIn = '1h') {
    return jwt.sign(payload, secret, { expiresIn });
}

function verifyToken(token) {
    return jwt.verify(token, secret);
}

module.exports = {
    generateToken,
    verifyToken
};
