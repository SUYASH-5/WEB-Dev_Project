require('dotenv').config();
const jwt = require('jsonwebtoken');

const tokenGen = (user, role) => {
  const secret = process.env.JWT_SECRET;

  const payload = {
    id: user._id,
    role, // <--- this is the crucial part
    email: user.email || null,
    username: user.username || null,
  };

  const token = jwt.sign(payload, secret, { expiresIn: '1d' });
  return token;
};

module.exports = tokenGen;
