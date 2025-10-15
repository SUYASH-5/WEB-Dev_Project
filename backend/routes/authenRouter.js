const {create,login,logout,update,deleteUser}=require('../controllers/authenCont');
const authMiddleware = require('../middleware/authMiddleware');
const express = require('express');
const router = express.Router();

router.post('/registerUser', create);
router.post('/loginUser', login);
router.post('/logout', authMiddleware, logout);
router.put('/updateUser', authMiddleware, update);
router.delete('/deleteUser', authMiddleware, deleteUser);
router.get('/verify', authMiddleware, (req, res) => {
  res.status(200).json({ message: 'Token is valid', user: req.user });
});

module.exports = router;