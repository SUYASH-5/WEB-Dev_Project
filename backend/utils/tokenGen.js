require('dotenv').config();
const jwt = require('jsonwebtoken');

const tokenGen = (user) => {
  const secret = process.env.JWT_SECRET;
  const token =  jwt.sign({
      data: {
          email: user.email,
          username: user.username
      }
  }, secret, { expiresIn: '1d' });
  return token;
}
module.exports = tokenGen;