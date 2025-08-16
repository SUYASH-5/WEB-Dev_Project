const jwt =require('jsonwebtoken');
const Teacher = require('../models/teacherDB');
const Student = require('../models/studentDB');

const authMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const userdata = jwt.verify(token, process.env.JWT_SECRET);
    if (!userdata) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const { email } = userdata.data;
    const user = await Teacher.findOne({ email }) || await Student.findOne({ email });
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    req.user = userdata;
    next();
};

module.exports = authMiddleware;
