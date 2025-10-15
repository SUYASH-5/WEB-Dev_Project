module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        socket.on('joinClass', ({ classId, userId }) => {
            socket.join(classId);
            io.to(classId).emit('userJoined', { userId });
        });

        socket.on('leaveClass', ({ classId, userId }) => {
            socket.leave(classId);
            io.to(classId).emit('userLeft', { userId });
        });

        socket.on('codeUpdate', ({ classId, code }) => {
            socket.to(classId).emit('codeUpdate', { code });
        });

        socket.on('remarkUpdate', ({ classId, remark }) => {
            socket.to(classId).emit('remarkUpdate', { remark });
        });

        socket.on('raiseHand', ({ classId, studentId }) => {
            io.to(classId).emit('handRaised', { studentId });
        });

        socket.on('lowerHand', ({ classId, studentId }) => {
            io.to(classId).emit('handLowered', { studentId });
        });

        socket.on('kickStudent', ({ classId, studentId }) => {
            io.to(classId).emit('userKicked', { userId: studentId });
        });

        socket.on('userLeft', ({ classId, userId }) => {
            io.to(classId).emit('userLeft', { userId });
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
};
