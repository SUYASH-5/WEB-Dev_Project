const mongoose = require('mongoose');
const dbConnect =async () => {
    try {
    await mongoose.connect(process.env.DATABASE_URL).then(() => {console.log('Connected to MongoDB')});
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}
module.exports = dbConnect;