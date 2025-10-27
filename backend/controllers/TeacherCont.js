const Student = require('../models/studentDB');
const Class = require('../models/classDB');
const Group = require('../models/groupDB');

const createClass = async (req, res) => {
    try{
        const group = req.user.group;
        const teacher = req.user._id;
        if (!group) {
            return res.status(400).json({ message: 'Group not found' });
        }
        const {title,description,startTime,capacity} = req.body;
        if (!title || !description  || !startTime || !capacity) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const currentTime = new Date();
        console.log("time decided: ",new Date(startTime));
        console.log("current time: ", currentTime);
        let status = '';
        if(currentTime == new Date(startTime)) {
            status = 'started';
        }
        else if(currentTime < new Date(startTime)) {
            status = 'upcoming';
        }
        else {
            return res.status(400).json({ message: 'Invalid start time' });
        }
        const Nclass = { 
            title,
            description,
            status,
            group,
            startTime,
            teacher,
            capacity
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
        const { group } = req.user;
        const { title, status, duration, startTime, code, remarks } = req.body;
        const existingClass = await Class.findById(id);
        if (!existingClass) {
            return res.status(404).json({ message: 'Class not found' });
        }
        if (!existingClass.group.equals(group)) {
            return res.status(403).json({ message: 'Forbidden' });
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
        const { group } = req.user;
        if (!id) {
            return res.status(400).json({ message: 'Class ID is required' });
        }
        const existingClass = await Class.findById(id);
        if (!existingClass) {
            return res.status(404).json({ message: 'Class not found' });
        }
        if (!existingClass.group.equals(group)) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        if(existingClass.status== 'Started' && existingClass.students.length > 0) {
            return res.status(400).json({ message: 'Ongoing class cannot be deleted' });
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

        res.status(200).json({ message: 'Student removed from class successfully', class: updatedClass });
    } catch (error) {
        console.error('Error removing student from class:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const groupControl = async (req, res) => {
    try {
        const { group } = req.user;
        const gData = await Group.findById(group).populate('students', 'name email').lean();
        if (!gData) {
            return res.status(400).json({ message: 'Group not found' });
        }
        res.status(200).json({ message: 'Group found', group: gData });
    } catch (error) {
        console.error('Error in group control:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const blockStudent = async (req, res) => {
    try {
        const { group } = req.user;
        const { studentId } = req.params;
        if (!group || !studentId) {
            return res.status(400).json({ message: 'Group and Student ID are required' });
        }

        const updatedGroup = await Group.findByIdAndUpdate(
            group,
            { $addToSet: { blockedStudents: studentId } , $pull: { students: studentId } },
            { new: true }
        );

        if (!updatedGroup) {
            return res.status(404).json({ message: 'Group not found' });
        }

        res.status(200).json({ message: 'Student blocked successfully', group: updatedGroup });
    } catch (error) {
        console.error('Error blocking student:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const addStudentToGroup = async (req, res) => {
    try {
        const { group } = req.user;
        const { studentId } = req.params;
        if (!group || !studentId) {
            return res.status(400).json({ message: 'Group and Student ID are required' });
        }

        const updatedGroup = await Group.findByIdAndUpdate(
            group,
            { $addToSet: { students: studentId } , $pull: { blockedStudents: studentId }},
            { new: true }
        );

        if (!updatedGroup) {
            return res.status(404).json({ message: 'Group not found' });
        }

        res.status(200).json({ message: 'Student added to group successfully', group: updatedGroup });
    } catch (error) {
        console.error('Error adding student to group:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const updateCode = async (req, res) => {
    try {
        const { id } = req.params;
        const { code } = req.body;
        const existingClass = await Class.findById(id);
        if (!existingClass) {
            return res.status(404).json({ message: 'Class not found' });
        }

        existingClass.code = code;
        await existingClass.save();

        res.status(200).json({ message: 'Class code updated successfully', class: existingClass });
    } catch (error) {
        console.error('Error updating class code:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    createClass,
    updateClass,
    deleteClass,
    classEnded,
    updateCode,
    removeStudent,
    groupControl,
    blockStudent,
    addStudentToGroup
};