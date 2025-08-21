const Teacher = require('../models/teacherDB');
const Student = require('../models/studentDB');
const Group = require('../models/groupDB');
const bcrypt = require('bcrypt');
const Validator =require('validator');
const tokenGen = require('../utils/tokenGen');

require('dotenv').config();


async function checkUserExistence(email, role) {
    if (role === 'teacher') {
        const exist = await Teacher.findOne({ email });
        if (exist) return { exists: true, message: 'User already exists' };
        const checkifStudent = await Student.findOne({ email });
        if (checkifStudent) return { exists: true, message: 'User exists as a student' };
    } else {
        const exist = await Student.findOne({ email });
        if (exist) return { exists: true, message: 'User already exists' };
        const checkifTeacher = await Teacher.findOne({ email });
        if (checkifTeacher) return { exists: true, message: 'User exists as a teacher' };
    }
    return { exists: false };
}

async function verifyGroup(group,role) {
    const groupExists = await Group.findOne({ name: group });
    if (!groupExists) return { exists: false };
    if(groupExists.teacher && role=='teacher'){
        return { exists: false, message: 'Group already has a teacher assigned' };
    }
    return { exists: true, id: groupExists._id };
}

async function updateGroup(group,id,role) {
    if(role == 'teacher') {
        await Group.findByIdAndUpdate(group, {$set:{ teacher: id }});
    }
    else {
        await Group.findByIdAndUpdate(group, {$push:{ students: id }});
    }
}
    

const create = async (req, res) => {
    try {
        const { name, email, gender, password, group, role } = req.body;
        if (!name || !email || !gender || !password || !group || !role) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        if (!Validator.isEmail(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }
        if (!Validator.isStrongPassword(password)) {
            return res.status(400).json({ message: 'please provide strong Password' });
        }

        const userCheck = await checkUserExistence(email, role);
        if (userCheck.exists) {
            return res.status(400).json({ message: userCheck.message });
        }

        const groupCheck = await verifyGroup(group,role);
        if (!groupCheck.exists) {
            return res.status(400).json({ message: 'Group does not exist' });
        }
        const groupid = groupCheck.id;
        const hashed = await bcrypt.hash(password, Validator.toInt(process.env.SALT_ROUNDS));
        let newUser;
        if (role == 'teacher') {
            newUser = new Teacher({ name, email, gender, password: hashed, group: groupid });
        } else {
            newUser = new Student({ name, email, gender, password: hashed, group: groupid });
        }
        await newUser.save();
        await updateGroup(groupid, newUser._id, role);
        const token = tokenGen(newUser);
        res.status(201).json({ message: 'User created successfully', user: newUser, token });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const login=async(req,res)=>{
    try{
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const user = await Teacher.findOne({ email }) || await Student.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const token = tokenGen(user);
        res.status(200).json({ message: 'Login successful', user, token });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const update = async (req, res) => {
    try {
        const id = req.user._id;
        const { email, name, gender, password } = req.body;
        if (!email || !name || !gender || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const exist = await Student.findOne({ _id: id }) || await Teacher.findOne({ _id: id });
        if (!exist) {
            return res.status(400).json({ message: 'User not found' });
        }
        const hashed = await bcrypt.hash(password, Validator.toInt(process.env.SALT_ROUNDS));
        let updatedUser={name, email, gender, password: hashed};
        if(exist.role === 'teacher') {  
            let teacher = await Teacher.findOneAndUpdate({ email },{ $set: updatedUser },{new:true});
            console.log(teacher);
        }
        else {
            let student = await Student.findOneAndUpdate({ email },{ $set: updatedUser },{new:true});
            console.log(student);
        }
        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const deleteUser = async (req, res) => {
    try {
        const id = req.user._id;
        const exist = await Student.findOne({ _id: id }) || await Teacher.findOne({ _id: id });
        if (!exist) {
            return res.status(400).json({ message: 'User not found' });
        }
        const email = exist.email;
        const group = exist.group;

        if(exist.role === 'teacher') {  
            await Group.updateOne({ _id: group }, { $unset: { teacher: "" } });
            let teacher = await Teacher.deleteOne({ email });
            console.log("Deleted teacher:", teacher);
        }
        else {
            await Group.updateOne({ _id: group }, { $pull: { students: id } });
            console.log(group,id);
            let student = await Student.deleteOne({ email });
            console.log("Deleted student:", student);
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const forgetPassword=async (req,res)=>{

};
const UpdatePassword = async (req,res)=>{

};


module.exports = {create, login, update, deleteUser, forgetPassword,UpdatePassword};