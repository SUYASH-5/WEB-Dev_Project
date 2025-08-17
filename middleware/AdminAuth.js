require('dotenv').config();
const Admin = require('../models/adminDB'); 
const jwt = require('jsonwebtoken');

const AdminAuth = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const userdata = jwt.verify(token, process.env.JWT_SECRET);
    if (!userdata) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const { email } = userdata.data;
    const admin = await Admin.findOne({ email });
    if (!admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    req.admin = admin;
    next();
}

module.exports = AdminAuth;