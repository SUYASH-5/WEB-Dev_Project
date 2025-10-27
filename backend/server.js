const express =require('express');
const cookieParser = require('cookie-parser');
const app = express();
const {createServer} =require('http');
const {Server}=require('socket.io');
const httpServer = createServer(app);
const cors = require('cors');
const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:5177',
        credentials: true
    }
});
const socketHandler=require('./socket/socketHandler');

const cron = require('node-cron');
const Class = require('./models/classDB');
require('dotenv').config();
const  dbConnect  = require('./config/mongoDB');
const authRouter = require('./routes/authenRouter'); 
const classRouter = require('./routes/classRouter');
const teacherRouter = require('./routes/TeachHandlerRouter');
const codeRouter = require('./routes/codeRouter');
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: 'http://localhost:5177', credentials: true }));

socketHandler(io);

app.use('/code', codeRouter);
app.use('/validate', authRouter);
app.use('/class', classRouter);
app.use('/OnlyT', teacherRouter);

dbConnect().then(() => {
    httpServer.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    });
}).catch((error) => {
    console.error('Database connection error:', error);
});

cron.schedule('*/30 * * * * *', async () => {
    try {
        const currentTime = new Date();
        const result = await Class.updateMany(
            {status: 'upcoming', startTime: { $lte: currentTime }},
            {$set: {status: 'Started'}}
        );
        if (result.modifiedCount > 0) {
          console.log(`Updated ${result.modifiedCount} class(es) to 'started'`);
        }
    } catch (error) {
        console.error('Error fetching upcoming classes:', error);
    }
});

const adminApp=express();
const adminRouter = require('./routes/adminRouter');

adminApp.use(express.json());
adminApp.use(cookieParser());

adminApp.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

adminApp.use('/admin', adminRouter);
dbConnect().then(() => {
    adminApp.listen(process.env.AdminPORT, () => {
        console.log(`Admin server is running on port ${process.env.AdminPORT}`);
    });
}).catch((error) => {
    console.error('Database connection error:', error);
});