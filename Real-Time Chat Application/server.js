import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// In-memory storage (replace with database in production)
const users = new Map();
const messages = [];
const typingUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user joining
  socket.on('user_join', (userData) => {
    const user = {
      id: socket.id,
      username: userData.username,
      avatar: userData.avatar,
      joinedAt: new Date()
    };
    
    users.set(socket.id, user);
    
    // Send existing messages to the new user
    socket.emit('message_history', messages);
    
    // Broadcast user list to all clients
    io.emit('users_update', Array.from(users.values()));
    
    // Notify others about new user
    socket.broadcast.emit('user_joined', user);
  });

  // Handle new messages
  socket.on('send_message', (messageData) => {
    const user = users.get(socket.id);
    if (user) {
      const message = {
        id: Date.now(),
        text: messageData.text,
        user: user,
        timestamp: new Date(),
        type: 'message'
      };
      
      messages.push(message);
      
      // Broadcast message to all clients
      io.emit('new_message', message);
    }
  });

  // Handle typing indicators
  socket.on('typing_start', () => {
    const user = users.get(socket.id);
    if (user) {
      typingUsers.set(socket.id, user);
      socket.broadcast.emit('user_typing', {
        user: user,
        typing: true
      });
    }
  });

  socket.on('typing_stop', () => {
    const user = users.get(socket.id);
    if (user) {
      typingUsers.delete(socket.id);
      socket.broadcast.emit('user_typing', {
        user: user,
        typing: false
      });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user) {
      users.delete(socket.id);
      typingUsers.delete(socket.id);
      
      // Update user list
      io.emit('users_update', Array.from(users.values()));
      
      // Notify others about user leaving
      socket.broadcast.emit('user_left', user);
    }
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});