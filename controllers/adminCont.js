const Teacher = require('../models/teacherDB');
const Student = require('../models/studentDB');
const Admin = require('../models/adminDB');
const Group = require('../models/groupDB');
const bcrypt = require('bcrypt');
const tokenGen = require('../utils/tokenGen');

const create= async (req, res) => {
    try{
        const {name,description} = req.body;
        if (!name || !description) {
            return res.status(400).json({ message: 'Name and description are required' });
        }
        const group = new Group({ name, description });
        await group.save();
        res.status(201).json({ message: 'Group created successfully', group });
    }
    catch(error){
        console.error('Error creating group:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }
        const admin = await Admin.findOne({ username });
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = tokenGen(admin);
        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.error('Error logging in admin:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const deleteGroup = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'Group ID is required' });
        }
        const deletedGroup = await Group.findByIdAndDelete(id);

        if (deletedGroup) {
            await Teacher.updateOne({ group: id }, { $unset: { group: "" } });
            await Student.updateMany({ group: id }, { $unset: { group: "" } });
        }
        else{
            return res.status(404).json({ message: 'Group not found' });
        }
        res.status(200).json({ message: 'Group deleted successfully' });
    } catch (error) {
        console.error('Error deleting group:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const getStudents = async (req, res) => {
    try {
        const students = await Student.find();
        res.status(200).json({ message: 'Students retrieved successfully', students });
    } catch (error) {
        console.error('Error retrieving students:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.find();
        res.status(200).json({ message: 'Teachers retrieved successfully', teachers });
    } catch (error) {
        console.error('Error retrieving teachers:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getGroups = async (req, res) => {
    try {
        const groups = await Group.find();
        res.status(200).json({ message: 'Groups retrieved successfully', groups });
    } catch (error) {
        console.error('Error retrieving groups:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const updateTeacher = async (req, res) => {
    try {
        const {teacher} = req.params;
        const {  name } = req.body;
        if (!teacher) {
            return res.status(400).json({ message: 'Teacher information is required' });
        }
        const updatedTeacher = await Group.findOne({name:name}, { $set: { teacher } }, { new: true });
        if (!updatedTeacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        res.status(200).json({ message: 'Teacher updated successfully', teacher: updatedTeacher });
    } catch (error) {
        console.error('Error updating teacher from group:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
const removeStudent = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'Student ID is required' });
        }
        const student = await Student.findById(id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        const StudentRemoved = await Group.updateOne({ _id: student.group }, { $pull: { students: id } });
        if (StudentRemoved) {
            await Student.updateOne({ _id: id },{ $unset: { group: "" } });
        }
        else{
            return res.status(404).json({ message: 'Student not found' });
        }
        res.status(200).json({ message: 'Student removed successfully' });
    } catch (error) {
        console.error('Error removing student from group:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
const addStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { group } = req.body;
        if (!id) {
            return res.status(400).json({ message: 'Student ID is required' });
        }
        const StudentAdded = await Group.updateOne({ name: group }, { $addToSet: { students: id } });
        if (StudentAdded) {
            await Student.updateOne({ _id: id }, { $set: { group: StudentAdded._id } });
        }
        else{
            return res.status(404).json({ message: 'Student already exists' });
        }
        res.status(200).json({ message: 'Student added successfully' });
    } catch (error) {
        console.error('Error adding student to group:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const addRemark =async(req,res)=>{
    try{
        const { id } = req.params;
        const { remark } = req.body;
        if (!id || !remark) {
            return res.status(400).json({ message: 'Student ID and remark are required' });
        }
        const student = await Student.findById(id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        student.remark = remark;
        await student.save();
        res.status(200).json({ message: 'Remark added successfully', student });
    }catch(error){
        console.error('Error adding remark to student:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const removeRemark = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'Student ID is required' });
        }
        const student = await Student.findById(id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        student.remark = 'None';
        await student.save();
        res.status(200).json({ message: 'Remark removed successfully', student });
    } catch (error) {
        console.error('Error removing remark from student:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const verifyTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'Teacher ID is required' });
        }
        const teacher = await Teacher.findById(id);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        teacher.ValidityState = 'valid';
        await teacher.save();
        res.status(200).json({ message: 'Teacher verified successfully', teacher });
    } catch (error) {
        console.error('Error verifying teacher:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
const ignoreTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'Teacher ID is required' });
        }
        const teacher = await Teacher.findById(id);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        teacher.ValidityState = 'invalid';
        await teacher.save();
        res.status(200).json({ message: 'Teacher ignored successfully', teacher });
    } catch (error) {
        console.error('Error ignoring teacher:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const getPendingRequests = async (req, res) => {
    try {
        const pendingRequests = await Teacher.find({ ValidityState: 'pending' });
        res.status(200).json({ message: 'Pending requests retrieved successfully', requests: pendingRequests });
    } catch (error) {
        console.error('Error retrieving pending requests:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
const getAttendance = async (req, res) => {
    try {
        const attendanceRecords = await Student.aggregate([
            {
                $project: {
                    name: 1,
                    email: 1,
                    attendanceCount: { $size: "$attendance" }
                }
            }
        ]);
        res.status(200).json({ message: 'Attendance records retrieved successfully', attendance: attendanceRecords });
    } catch (error) {
        console.error('Error retrieving attendance records:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { create, login, deleteGroup,getStudents, getTeachers, getGroups, updateTeacher, removeStudent, addStudent, addRemark, removeRemark, verifyTeacher, ignoreTeacher, getPendingRequests, getAttendance };
