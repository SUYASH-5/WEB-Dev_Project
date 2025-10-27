const jwt =require('jsonwebtoken');
const Teacher = require('../models/teacherDB');

const verifyTeacher = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized - No token provided' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        if (!decoded) {
            return res.status(401).json({ message: 'Unauthorized - Invalid token' });
        }
        const {id} =decoded;
        const teacher = await Teacher.findById(id);
        if (!teacher) {
            return res.status(401).json({ message: 'Unauthorized - User not found' });
        }
        req.user = teacher;
        next();
    } catch (error) {
        console.error('Error verifying teacher token:', error);
        res.status(401).json({ message: 'Unauthorized' });
    }
};

module.exports = verifyTeacher;
