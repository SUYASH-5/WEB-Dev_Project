const jwt =require('jsonwebtoken');
const Teacher = require('../models/teacherDB');

const verifyTeacher = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        if (!decoded) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const {email} =decoded.data;
        const teacher = await Teacher.findOne({ email });
        if (!teacher) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        req.user = teacher;
        next();
    } catch (error) {
        console.error('Error verifying teacher token:', error);
        res.status(401).json({ message: 'Unauthorized' });
    }
};

module.exports = verifyTeacher;
