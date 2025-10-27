const {create,login,logout,deleteGroup,getStudents,getTeachers,getGroups,removeTeacher,updateTeacher,removeStudent,addRemark,removeRemark,verifyTeacher,ignoreTeacher,addStudent,getPendingRequests,getAttendance}=require('../controllers/adminCont');
const AdminAuth = require('../middleware/AdminAuth');
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

router.post('/createGroup', AdminAuth, create);
router.post('/loginAdmin', login);
router.get('/logoutAdmin', AdminAuth, logout);
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
router.delete('/removeTeacher/:id', AdminAuth, removeTeacher);

router.get("/verify-session", (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  const userdata = jwt.verify(token, process.env.JWT_SECRET);
  if (!userdata) return res.status(401).json({ message: "Session expired" });

  return res.status(200).json({ message: "Authenticated" });
});


module.exports = router;