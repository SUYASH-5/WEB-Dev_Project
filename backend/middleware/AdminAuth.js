require('dotenv').config();
const Admin = require('../models/adminDB'); 
const jwt = require('jsonwebtoken');

const AdminAuth = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const userdata = jwt.verify(token, process.env.JWT_SECRET);
    if (!userdata) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const { id } = userdata;
    const admin = await Admin.findById(id);
    if (!admin) {
        return res.status(401).json({ message: 'Unauthorized - User not found' });
    }
    req.admin = admin;
    next();
}

module.exports = AdminAuth;