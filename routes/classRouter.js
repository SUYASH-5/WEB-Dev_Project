const express=require('express');
const router=express.Router();
const isMember = require('../middleware/isMember');
const verifyTeacher = require('../middleware/TeacherAuth.js');
const {enterClass,saveClassActivity}=require('../controllers/classActivityCont');

router.post('/enter/:id', isMember, enterClass);
router.post('/save/:classId', verifyTeacher, isMember, saveClassActivity);

module.exports = router;