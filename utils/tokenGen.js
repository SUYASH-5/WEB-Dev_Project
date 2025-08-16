require('dotenv').config();
const jwt = require('jsonwebtoken');

const tokenGen = (user) => {
  const secret = process.env.JWT_SECRET;
  const token =  jwt.sign({
      data: {
          email: user.email,
          password: user.password
      }
  }, secret, { expiresIn: '1h' });
  return token;
}
module.exports = tokenGen;