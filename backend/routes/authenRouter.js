const {create,login,logout,update,deleteUser}=require('../controllers/authenCont');
const authMiddleware = require('../middleware/authMiddleware');
const express = require('express');
const router = express.Router();

router.post('/registerUser', create);
router.post('/loginUser', login);
router.post('/logout', authMiddleware, logout);
router.put('/updateUser', authMiddleware, update);
router.delete('/deleteUser', authMiddleware, deleteUser);

module.exports = router;