const express=require('express');
const router=express.Router();
const isMember = require('../middleware/isMember');
const verifyTeacher = require('../middleware/TeacherAuth.js');
const {enterClass,saveClassActivity,leaveClass,getClasses,getClassById}=require('../controllers/classActivityCont');

router.get('/',isMember, getClasses);
router.get('/:id', isMember, getClassById);
router.post('/enter/:id', isMember, enterClass);
router.put('/save/:classId', verifyTeacher, isMember, saveClassActivity);
router.put('/leave/:id', isMember, leaveClass);

module.exports = router;