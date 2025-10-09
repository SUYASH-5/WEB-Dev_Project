const jwt = require('jsonwebtoken');

const isMember = async (req, res, next) => {
    const id = req.params.id;
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const userdata = jwt.verify(token, process.env.JWT_SECRET);
        if (!userdata) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const { email } = userdata.data;
        const user = await Teacher.findOne({ email }) || await Student.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        if (!user.group.equals(id)) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        req.user = user;
        next();
    } catch (error) {
        console.error('Error verifying token:', error);
        return res.status(401).json({ message: 'Unauthorized' });
    }
};

module.exports = isMember;
