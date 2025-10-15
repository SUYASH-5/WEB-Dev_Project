const mongoose =require ('mongoose');

const teachSchema= new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  gender: { type: String, required: true },
  password: { type: String, required: true },
  group: { type: String, required: true },
  role: { type: String, default: 'teacher' },
  ValidityState: { type: String, enum: ['pending', 'invalid','valid'], default: 'pending' }
},{
    timestamps: true
});
const Teacher = mongoose.model('Teacher', teachSchema);
module.exports = Teacher;
