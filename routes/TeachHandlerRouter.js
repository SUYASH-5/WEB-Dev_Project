const express=require('express');
const router=express.Router();
const verifyTeacher = require('../middleware/TeacherAuth');
const isMember =require('../middleware/isMember');
const { createClass,updateClass,deleteClass, classEnded, removeStudent} = require('../controllers/TeacherCont');

router.post('/create-class', verifyTeacher, createClass);
router.put('/update-class/:id', verifyTeacher,isMember, updateClass);
router.delete('/delete-class/:id', verifyTeacher,isMember, deleteClass);
router.put('/class-ended/:id', verifyTeacher, isMember, classEnded);
router.put('/remove-student/:classId/:studentId', verifyTeacher, isMember, removeStudent);

module.exports = router;