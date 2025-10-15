const express=require('express');
const router=express.Router();
const verifyTeacher = require('../middleware/TeacherAuth');
const { createClass,updateClass,deleteClass, classEnded, removeStudent} = require('../controllers/TeacherCont');

router.post('/create-class', verifyTeacher, createClass);
router.put('/update-class/:id', verifyTeacher, updateClass);
router.delete('/delete-class/:id', verifyTeacher, deleteClass);
router.put('/class-ended/:id', verifyTeacher, classEnded);
router.put('/remove-student/:classId/:studentId', verifyTeacher, removeStudent);

module.exports = router;