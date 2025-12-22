import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  if (typeof window === "undefined") return null;
  if (socket && socket.connected) return socket;

  // Use NEXT_PUBLIC_BACKEND_URL if available, fallback to localhost:5000
  const backend = 
    process.env.NEXT_PUBLIC_BACKEND_URL || 
    process.env.BACKEND_URL || 
    "http://localhost:5000";

  // Disable Socket.IO for Vercel deployments (serverless doesn't support WebSocket)
  if (backend.includes('.vercel.app')) {
    console.warn("Socket.IO disabled: Backend is on Vercel serverless (WebSocket not supported)");
    return null;
  }

  try {
    socket = io(backend, { 
      transports: ["websocket", "polling"], 
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("Socket connected (client):", socket?.id);
    });

    socket.on("connect_error", (err: Error) => {
      console.error("Socket connect error:", err.message);
    });

    socket.on("disconnect", (reason: string) => {
      console.log("Socket disconnected:", reason);
    });

  } catch (err) {
    console.warn("Socket.io client not available:", err);
    socket = null;
  }

  return socket;
}

// Export singleton socket instance
export { socket };

// Initialize on import (client-side only)
if (typeof window !== "undefined") {
  getSocket();
}
