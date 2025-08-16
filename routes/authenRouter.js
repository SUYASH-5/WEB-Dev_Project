const {create,login,update}=require('../controllers/authenCont');
const authMiddleware = require('../middleware/authMiddleware');
const express = require('express');
const router = express.Router();

router.post('/registerUser', create);
router.post('/loginUser', login);
router.put('/updateUser', authMiddleware, update);

module.exports = router;