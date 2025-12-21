// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import bodyParser from "body-parser"
// import mongoose from 'mongoose'
// import userroutes from './routes/auth.js'
// dotenv.config();
// const app = express();
// app.use(cors());
// app.use(express.json({limit:"30mb",extended:true}))
// app.use(express.urlencoded({limit:"30mb",extended:true}))

// app.get("/",(req,res)=>{
//     res.send("hello")
// })
// app.use(bodyParser.json());
// app.use("/user",userroutes)
// const PORT = process.env.PORT || 5000

// app.listen(PORT,()=>{
//     console.log("Server is running")
// })
// const DBURL = process.env.DB_URL
// mongoose.connect(DBURL).then(()=>{
//     console.log("Database connected")
// }).catch((err)=>{
//     console.log(err)
// })
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import userroutes from "./routes/auth.js";
import videoroutes from "./routes/video.js";
import likeroutes from "./routes/like.js";
import watchlaterroutes from "./routes/watchlater.js";
import historyrroutes from "./routes/history.js";
import commentroutes from "./routes/comment.js";
import subscriptionRoutes from "./routes/subscription.js";
import downloadRoutes from "./routes/download.js";
import paymentRoutes from "./routes/payment.js";

dotenv.config();
const app = express();
import path from "path";

// CORS configuration for production
const corsOptions = {
  origin: process.env.FRONTEND_URL 
    ? [process.env.FRONTEND_URL, "http://localhost:3000"]
    : true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use("/uploads", express.static(path.join("uploads")));

app.get("/", (req, res) => {
  res.send("YouTube backend is working - All features enabled");
});

app.use(bodyParser.json());

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// API routes
app.use("/user", userroutes);
app.use("/video", videoroutes);
app.use("/like", likeroutes);
app.use("/watch", watchlaterroutes);
app.use("/history", historyrroutes);
app.use("/comment", commentroutes);
app.use("/subscribe", subscriptionRoutes);
app.use("/download", downloadRoutes);
app.use("/payment", paymentRoutes);

const PORT = process.env.PORT || 5000;

// Start HTTP server and attach Socket.IO
const server = app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});

// Initialize Socket.IO
import { initSocket } from "./socket.js";
try {
  initSocket(server);
  console.log("Socket.IO initialized");
} catch (err) {
  console.error("Failed to initialize Socket.IO:", err);
}

const DBURL = process.env.DB_URL;
mongoose
  .connect(DBURL, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message || error);
    // Do not exit process here; continue running so the API can still respond to non-DB routes
  });

// Protect the process from unexpected crashes so dev server stays up while DB is unreachable
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});