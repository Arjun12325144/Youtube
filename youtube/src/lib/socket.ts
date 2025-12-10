let socket: any = null;

export function getSocket() {
  if (typeof window === "undefined") return null;
  if (socket) return socket;

  // Use NEXT_PUBLIC_BACKEND_URL if available, fallback to localhost:5000
  const backend = (process.env.NEXT_PUBLIC_BACKEND_URL as string) || (process.env.BACKEND_URL as string) || "http://localhost:5000";

  try {
    // dynamic import to avoid SSR errors
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const { io } = require("socket.io-client");
    socket = io(backend, { transports: ["websocket"], withCredentials: true });
    socket.on("connect", () => {
      console.log("Socket connected (client):", socket.id);
    });
    socket.on("connect_error", (err: any) => {
      console.error("Socket connect error:", err);
    });
  } catch (err) {
    console.warn("Socket.io client not available:", err);
    socket = null;
  }

  return socket;
}
