const express =require('express');
const app = express();
require('dotenv').config();
const  dbConnect  = require('./config/mongoDB');
const authRouter = require('./routes/authenRouter'); 
app.use(express.json());

app.use('/validate', authRouter);

dbConnect().then(() => {
    app.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    });
}).catch((error) => {
    console.error('Database connection error:', error);
});
