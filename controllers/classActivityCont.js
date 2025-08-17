const Teacher = require('../models/teacherDB');
const Student = require('../models/studentDB');
const Class = require('../models/classDB');
const e = require('express');

const enterClass = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const existingClass = await Class.findById(id);
        if (!existingClass) {
            return res.status(404).json({ message: 'Class not found' });
        }
        if (existingClass.status !== 'started') {
            return res.status(400).json({ message: 'Class is not currently active' });
        }
        if(existingClass.blocked.includes(userId)) {
            return res.status(403).json({ message: 'You are blocked from this class' });
        }
        const user= await Teacher.findById(userId)||await Student.findById(userId);
        if(user.role =='teacher') {
            existingClass.teacher= userId;
        } else {
            existingClass.students.push(userId);
        }
        await existingClass.save();

        res.status(200).json({ message: 'Successfully entered class', class: existingClass });
    } catch (error) {
        console.error('Error entering class:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    enterClass
};