const Teacher = require('../models/teacherDB');
const Student = require('../models/studentDB');
const Class = require('../models/classDB');

const getClasses = async (req, res) => {
    try {
        const groupId = req.groupId;
        const classes = await Class.find({ group:groupId });
        res.status(200).json({ classes });
    }
    catch (error) {
        console.error('Error fetching classes:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getClassById = async (req, res) => {
    try {
        const { id } = req.params;
        const groupId = req.groupId;
        const existingClass = await Class.findById(id).populate('group', 'name').populate('teacher', 'name email').populate('students', 'name email').lean();
        if (existingClass.group._id.toString() !== groupId.toString()) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        if (!existingClass) {
            return res.status(404).json({ message: 'Class not found' });
        }
        res.status(200).json({ class: existingClass });
    }
    catch (error) {
        console.error('Error fetching class by ID:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};



const enterClass = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const existingClass = await Class.findById(id);
        if (!existingClass) {
            return res.status(404).json({ message: 'Class not found' });
        }
        if (existingClass.status !== 'Started') {
            return res.status(400).json({ message: 'Class is not currently active' });
        }
        if (existingClass.blocked.some(id => id.equals(userId))) {
          return res.status(403).json({ message: 'You are blocked from this class' });
        }
        const user = await Student.findById(userId);
        if (user) {
            await Class.findByIdAndUpdate(id, { $addToSet: { students: user._id } }, { new: true });
        }
        await existingClass.save();

        res.status(200).json({ message: 'Successfully entered class', class: existingClass });
    } catch (error) {
        console.error('Error entering class:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const saveClassActivity = async (req, res) => {
    try {
        const { classId } = req.params;
        const { code, remark } = req.body;

        const existingClass = await Class.findById(classId);
        if (!existingClass) {
            return res.status(404).json({ message: 'Class not found' });
        }
        if (existingClass.status !== 'started') {
            return res.status(400).json({ message: 'Class is not currently active' });
        }
        if (!code || !remark) {
            return res.status(400).json({ message: 'Code and remark are required' });
        }

        existingClass.code = code;
        existingClass.remarks = remark;
        await existingClass.save();

        io.to(classId).emit('codeUpdate', { code });
        io.to(classId).emit('remarkUpdate', { remark });

        res.status(200).json({ message: 'Activity saved successfully', class: existingClass });
    } catch (error) {
        console.error('Error saving class activity:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const leaveClass = async (req, res) => {
    try{
        const { id } = req.params;
        const userId = req.user.id;

        const existingClass = await Class.findById(id);
        if (!existingClass) {
            return res.status(404).json({ message: 'Class not found' });
        }
        if (existingClass.status !== 'started') {
            return res.status(400).json({ message: 'Class is not currently active' });
        }

        const updatedClass = await Class.findOneAndUpdate(
            { _id: existingClass._id, students: userId },  
            {
                $pull: { students: userId },
            },
            { new: true }                           
        );

        io.to(id).emit('userLeft', { userId });

        res.status(200).json({ message: 'Successfully left class', class: updatedClass });
    }
    catch(error) {
        console.error('Error leaving class:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    enterClass,
    saveClassActivity,
    leaveClass,
    getClasses,
    getClassById
};