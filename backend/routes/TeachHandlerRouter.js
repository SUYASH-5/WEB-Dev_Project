const express=require('express');
const router=express.Router();
const verifyTeacher = require('../middleware/TeacherAuth');
const { createClass,updateClass,deleteClass, classEnded, removeStudent, blockStudent,addStudentToGroup, updateCode} = require('../controllers/TeacherCont');

router.post('/create-class', verifyTeacher, createClass);
router.put('/update-class/:id', verifyTeacher, updateClass);
router.delete('/delete-class/:id', verifyTeacher, deleteClass);
router.put('/class-ended/:id', verifyTeacher, classEnded);
router.put('/remove-student/:classId/:studentId', verifyTeacher, removeStudent);
router.put('/block-student/:studentId', verifyTeacher, blockStudent);
router.put('/add-student/:studentId', verifyTeacher, addStudentToGroup);
router.put('/update-code/:id', verifyTeacher, updateCode);

module.exports = router;