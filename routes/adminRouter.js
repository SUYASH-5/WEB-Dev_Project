const {create,login,deleteGroup,getStudents,getTeachers,getGroups,updateTeacher,removeStudent,addRemark,removeRemark,verifyTeacher,ignoreTeacher,addStudent,getPendingRequests,getAttendance}=require('../controllers/adminCont');
const AdminAuth = require('../middleware/AdminAuth');
const express = require('express');
const router = express.Router();

router.post('/createGroup', AdminAuth, create);
router.post('/loginAdmin', login);
router.delete('/removeGroup/:id', AdminAuth, deleteGroup);
router.get('/getStudents', AdminAuth, getStudents);
router.get('/getTeachers', AdminAuth, getTeachers);
router.get('/getGroups', AdminAuth, getGroups);
router.get('/pendingRequests', AdminAuth, getPendingRequests);
router.put('/updateTeacher/:id', AdminAuth, updateTeacher);
router.put('/verifyTeacher/:id', AdminAuth, verifyTeacher);
router.put('/ignoreTeacher/:id', AdminAuth, ignoreTeacher);
router.put('/addStudent/:id', AdminAuth, addStudent);
router.put('/removeStudent/:id', AdminAuth, removeStudent);
router.put('/addRemark/:id', AdminAuth, addRemark);
router.put('/removeRemark/:id', AdminAuth, removeRemark);
router.get('/getAttendance', AdminAuth, getAttendance);

module.exports = router;