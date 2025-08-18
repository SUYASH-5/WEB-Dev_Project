const Student = require('../models/studentDB');
const Class = require('../models/classDB');

const createClass = async (req, res) => {
    try{
        const group = req.user.group;
        if (!group) {
            return res.status(400).json({ message: 'Group not found' });
        }
        const {title,status,duration,startTime} = req.body;
        if (!title || !status || !duration || !startTime) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const Nclass = { 
            title,
            status,
            group,
            duration, 
            startTime 
        };
        const newClass = new Class(Nclass);
        await newClass.save();
        res.status(201).json({ message: 'Class created successfully', class: newClass });
    } catch (error) {
        console.error('Error creating class:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const updateClass = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, status, duration, startTime, code, remarks } = req.body;
        if (!id || !title || !status || !duration || !startTime || !code || !remarks) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const existingClass = await Class.findById(id);
        if (!existingClass) {
            return res.status(404).json({ message: 'Class not found' });
        }
        if(existingClass.status == 'upcoming') {
            await Class.findByIdAndUpdate(id, {
                title,
                status,
                duration,
                startTime,
            }, { new: true });
        } else if(existingClass.status == 'ended') {
            await Class.findByIdAndUpdate(id, {
                title,
                status,
                code,
                remarks
            }, { new: true });
        } else {
            await Class.findByIdAndUpdate(id, {
                title,
                status
            }, { new: true });
        }

        res.status(200).json({ message: 'Class updated successfully' });
    } catch (error) {
        console.error('Error updating class:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};  
const deleteClass = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'Class ID is required' });
        }
        const existingClass = await Class.findById(id);
        if (!existingClass) {
            return res.status(404).json({ message: 'Class not found' });
        }
        if (existingClass.status == 'ended') {
            return res.status(400).json({ message: 'Class cannot be deleted' });
        }
        const deletedClass = await Class.findByIdAndDelete(id);
        if (!deletedClass) {
            return res.status(404).json({ message: 'Class not found' });
        }
        res.status(200).json({ message: 'Class deleted successfully' });
    } catch (error) {
        console.error('Error deleting class:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const classEnded = async (req, res) => {
    try {
        const { id } = req.params;

        const existingClass = await Class.findById(id);
        if (!existingClass) {
            return res.status(404).json({ message: 'Class not found' });
        }

        existingClass.endTime = new Date();
        existingClass.status = 'Ended';
        const newDuration = existingClass.endTime - existingClass.startTime;
        const durationInMinutes = Math.floor(newDuration / 1000 / 60);
        existingClass.duration = durationInMinutes;
        existingClass.code = req.body.code || existingClass.code;
        existingClass.remarks = req.body.remarks || existingClass.remarks;
        await existingClass.save();
        if (existingClass.students.length > 0) {
            await Promise.all(
                existingClass.students.map(studentId =>
                    Student.findByIdAndUpdate(studentId, { $push: { attendance: existingClass.endTime } })
                )
            );
        }

        res.status(200).json({ message: 'Class ended successfully', class: existingClass });
    } catch (error) {
        console.error('Error ending class:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const removeStudent = async (req, res) => {
    try {
        const { classId, studentId } = req.params;
        if (!classId || !studentId) {
            return res.status(400).json({ message: 'Class ID and Student ID are required' });
        }
        const updatedClass = await Class.findOneAndUpdate(
            { _id: classId, students: studentId },  
            {
                $pull: { students: studentId },
                $addToSet: { blocked: studentId }
            },
            { new: true }                           
        );
        if (!updatedClass) {
            return res.status(404).json({ message: 'Class not found or student not in class' });
        }

        io.to(classId).emit('userKicked', { userId: studentId });
        io.to(classId).emit('userBlocked', { userId: studentId });
        io.to(classId).emit('userLeft', { userId: studentId });

        res.status(200).json({ message: 'Student removed from class successfully', class: updatedClass });
    } catch (error) {
        console.error('Error removing student from class:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    createClass,
    updateClass,
    deleteClass,
    classEnded,
    removeStudent
};