const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    title: { type: String, required: true },
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    status: { type: String, enum: ['upcoming','started', 'ended'], required: true },
    duration: { type: Number , required: true}, 
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    blocked: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    startTime: { type: Date, required: true },
    endTime: { type: Date, default: null },
    code: { type: String },
    remarks: { type: String }
},{
    timestamps: true
})

const Class = mongoose.model('Class', classSchema);

module.exports = Class;
