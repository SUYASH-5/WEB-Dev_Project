const jwt = require('jsonwebtoken');
const Teacher = require('../models/teacherDB');
const Student = require('../models/studentDB');

const isMember = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized - No token provided' });
    }
    try {
        const userdata = jwt.verify(token, process.env.JWT_SECRET);
        if (!userdata) {
            return res.status(401).json({ message: 'Unauthorized - Invalid token' });
        }
        const { id, role } = userdata;
        let user;
        if (role === "teacher") {
            user = await Teacher.findById(id);
        } else {
            user = await Student.findById(id);
        }
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized - User not found' });
        }
        req.user = user;
        req.role = role;
        req.groupId = user.group;
        next();
    } catch (error) {
        console.error('Error verifying token:', error);
        return res.status(401).json({ message: 'Unauthorized' });
    }
};

module.exports = isMember;
