const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

let currentHandStatus = {
    isActive: false,
    timestamp: Date.now()
};

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    
    // Send current status to newly connected client
    socket.emit('status-update', currentHandStatus);
    
    // Listen for hand detection data from Front End 1
    socket.on('hand-status', (data) => {
        console.log('Received hand status:', data);
        
        currentHandStatus = {
            isActive: data.isActive,
            timestamp: Date.now()
        };
        
        // Broadcast to all connected clients (Front End 2)
        io.emit('status-update', currentHandStatus);
    });
    
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// REST endpoint for status check
app.get('/api/status', (req, res) => {
    res.json(currentHandStatus);
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Socket.IO server ready`);
});
