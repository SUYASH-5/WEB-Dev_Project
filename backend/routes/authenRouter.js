const {create,login,logout,update,deleteUser,group, profile}=require('../controllers/authenCont');
const authMiddleware = require('../middleware/authMiddleware');
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

router.post('/registerUser', create);
router.post('/loginUser', login);
router.get('/logout', authMiddleware, logout);
router.put('/updateUser', authMiddleware, update);
router.delete('/deleteUser', authMiddleware, deleteUser);
router.get('/group', authMiddleware, group);
router.get('/profile', authMiddleware, profile);
router.get('/verify', (req, res) => {
  const token = req.cookies.token;
    if (!token) return res.status(204).json({ message: "Not authenticated" });
  
    const userdata = jwt.verify(token, process.env.JWT_SECRET);
    if (!userdata) return res.status(401).json({ message: "Session expired" });
    return res.status(200).json({ message: "Authenticated", userdata });
});

module.exports = router;