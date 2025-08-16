const mongoose =require ('mongoose');

const teachSchema= new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  class: { type: String, required: true },
  role: { type: String, default: 'teacher' },
  ValidityState: { type: String, enum: ['pending', 'invalid','valid'], default: 'pending' }
},{
    timestamps: true
});
const Teacher = mongoose.model('Teacher', teachSchema);
module.exports = Teacher;
