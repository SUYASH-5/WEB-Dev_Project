const express=require('express');
const router=express.Router();
const isMember = require('../middleware/isMember');
const {enterClass}=require('../controllers/classActivityCont');

router.post('/enter/:id', isMember, enterClass);

module.exports = router;