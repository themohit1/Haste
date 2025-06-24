const express = require('express');
const socketio = require('socket.io');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

const server = app.listen(PORT);
const io = socketio(server);
const ids = {};

io.on('connection', (socket) => {
    socket.on('create-id', (data) => {
        const { id, peerId } = data;
        if (ids[id]) {
            socket.emit('id-exists', id);
        } else {
            ids[id] = { senderPeerId: peerId };
            socket.shareId = id; 
            socket.isSender = true;
            socket.join(id);
            socket.emit('id-created', id);
        }
    });

    socket.on('join-id', (id) => {
        const session = ids[id];
        if (session) {
            socket.emit('sender-info', { peerId: session.senderPeerId });
        } else {
            socket.emit('id-not-found', id);
        }
    });

    socket.on('disconnect', () => {
        if (socket.isSender && socket.shareId && ids[socket.shareId]) {
            io.to(socket.shareId).emit('peer-disconnected', { message: 'The file share has ended.' });
            delete ids[socket.shareId];
        }
    });
});