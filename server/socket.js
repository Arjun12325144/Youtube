import { Server } from "socket.io";

let io = null;

export const initSocket = (server) => {
  if (io) return io;
  
  // Allow all origins in development, specific origins in production
  const corsOrigins = process.env.FRONTEND_URL 
    ? [process.env.FRONTEND_URL, "http://localhost:3000"]
    : true;
  
  io = new Server(server, {
    cors: {
      origin: corsOrigins,
      credentials: true,
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // Join a room (for video calls)
    socket.on("join-room", ({ roomId, userName }) => {
      socket.join(roomId);
      socket.to(roomId).emit("user-joined-call", { userName, socketId: socket.id });
      console.log(`${userName} joined room: ${roomId}`);
    });

    // Video Room Join
    socket.on("join-video-room", ({ roomId, userName, userId }) => {
      socket.join(roomId);
      socket.to(roomId).emit("user-joined-video", { userName, socketId: socket.id });
      console.log(`${userName} joined video room: ${roomId}`);
    });

    // Leave video room
    socket.on("leave-video-room", ({ roomId }) => {
      socket.leave(roomId);
      socket.to(roomId).emit("user-left-video", { socketId: socket.id });
    });

    // Leave a room
    socket.on("leave-room", ({ roomId, userName }) => {
      socket.leave(roomId);
      socket.to(roomId).emit("user-left-call", { userName, socketId: socket.id });
      console.log(`${userName} left room: ${roomId}`);
    });

    // Video offer (WebRTC)
    socket.on("video-offer", ({ offer, roomId, userName }) => {
      socket.to(roomId).emit("video-offer", { offer, userName, senderId: socket.id });
    });

    // Video answer (WebRTC)
    socket.on("video-answer", ({ answer, roomId }) => {
      socket.to(roomId).emit("video-answer", { answer, answererId: socket.id });
    });

    // Video call signaling - initiating a call
    socket.on("call-user", ({ offer, roomId, callerName }) => {
      socket.to(roomId).emit("incoming-call", { offer, callerName, callerId: socket.id });
    });

    // Video call signaling - answering a call
    socket.on("call-answer", ({ answer, roomId }) => {
      socket.to(roomId).emit("call-answered", { answer, answererId: socket.id });
    });

    // ICE candidate exchange for WebRTC
    socket.on("ice-candidate", ({ candidate, roomId }) => {
      socket.to(roomId).emit("ice-candidate", { candidate, senderId: socket.id });
    });

    // End call
    socket.on("call-ended", ({ roomId }) => {
      socket.to(roomId).emit("call-ended", { endedBy: socket.id });
    });

    // Screen sharing notification
    socket.on("screen-share-started", ({ roomId }) => {
      socket.to(roomId).emit("screen-share-started", { sharerId: socket.id });
    });

    socket.on("screen-share-stopped", ({ roomId }) => {
      socket.to(roomId).emit("screen-share-stopped", { sharerId: socket.id });
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
      // Notify all rooms the user was in
      socket.rooms.forEach((room) => {
        if (room !== socket.id) {
          socket.to(room).emit("user-left-call", { socketId: socket.id });
          socket.to(room).emit("user-left-video", { socketId: socket.id });
        }
      });
    });
  });

  return io;
};

export const getIO = () => io;
