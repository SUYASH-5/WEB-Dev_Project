const Teacher = require('../models/teacherDB');
const Student = require('../models/studentDB');
const bcrypt = require('bcrypt');
const Validator =require('validator');
const tokenGen = require('../utils/tokenGen');
require('dotenv').config();


const create = async (req, res) => {
    try {
        const { name, email, password, Uclass, role } = req.body;
        if (!name || !email || !password || !Uclass || !role) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        if (!Validator.isEmail(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }
        if (!Validator.isStrongPassword(password)) {
            return res.status(400).json({ message: 'please provide strong Password' });
        }

        if (role == 'teacher') {
            const exist = await Teacher.findOne({ email });
            if (exist) {
                return res.status(400).json({ message: 'User already exists' });
            }
            const checkifStudent = await Student.findOne({ email });
            if (checkifStudent) {
                return res.status(400).json({ message: 'User exists as a student' });
            }
        } else {
            const exist = await Student.findOne({ email });
            if (exist) {
                return res.status(400).json({ message: 'User already exists' });
            }
            const checkifTeacher = await Teacher.findOne({ email });
            if (checkifTeacher) {
                return res.status(400).json({ message: 'User exists as a teacher' });
            }
        }
        const hashed = await bcrypt.hash(password, Validator.toInt(process.env.SALT_ROUNDS));
        let newUser;
        if (role == 'teacher') {
            newUser = new Teacher({ name, email, password: hashed, class: Uclass });
        } else {
            newUser = new Student({ name, email, password: hashed, class: Uclass });
        }
        await newUser.save();
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
        const { email, name, password, Uclass } = req.body;
        if (!email || !name || !password || !Uclass) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const exist = await Student.findOne({ email }) || await Teacher.findOne({ email });
        if (!exist) {
            return res.status(400).json({ message: 'User not found' });
        }
        const hashed = await bcrypt.hash(password, Validator.toInt(process.env.SALT_ROUNDS));
        const user = exist.role === 'teacher' ? await Teacher.findOne({ email }) : await Student.findOne({ email });
        await user.updateOne({ email }, { name, email, password: hashed, class: Uclass });
        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {create, login, update};