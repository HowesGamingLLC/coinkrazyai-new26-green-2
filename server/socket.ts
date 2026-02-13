import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";

let io: SocketIOServer | null = null;

export function setupSocketIO(server: HttpServer) {
  io = new SocketIOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.IO has not been initialized");
  }
  return io;
}

export function emitWalletUpdate(userId: string, data: any) {
  if (io) {
    io.emit(`wallet:${userId}`, data);
    // For demo/simplicity, also emit global for the single user case
    io.emit("wallet:update", data);
  }
}

export function emitGameUpdate(gameType: string, data: any) {
  if (io) {
    io.emit(`${gameType}:update`, data);
  }
}
