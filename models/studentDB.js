const mongoose=require ('mongoose');
const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  gender: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'student' },
  attendance: { type: [Date], default: [] },
  group: { type: String, required: true },
  remark: { type: String, default: 'None' }
},{
    timestamps: true
});
const Student = mongoose.model('Student', studentSchema);
module.exports = Student;
