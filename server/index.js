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

// CORS configuration - allow all origins for Vercel deployment
const allowedOrigins = [
  "https://youtube-frontend-three.vercel.app",
  "https://youtube-frontend.vercel.app",
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow all vercel.app subdomains and localhost
    if (origin.includes('vercel.app') || origin.includes('localhost')) {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Allow anyway for now to debug
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json({ limit: "100mb", extended: true }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(bodyParser.json({ limit: "100mb" }));

// MongoDB connection with caching for serverless
let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  try {
    const DBURL = process.env.DB_URL;
    if (!DBURL) {
      throw new Error("DB_URL environment variable is not set");
    }
    
    await mongoose.connect(DBURL, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
    });
    
    isConnected = true;
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    isConnected = false;
    throw error;
  }
};

// Middleware to ensure DB connection before handling requests
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    res.status(500).json({ 
      message: "Database connection failed", 
      error: error.message 
    });
  }
});

app.get("/", (req, res) => {
  res.json({ 
    status: "success",
    message: "YouTube Clone API is running",
    dbConnected: isConnected,
    timestamp: new Date().toISOString()
  });
});

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

// For local development
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  // Initialize Socket.IO only for local development
  import("./socket.js").then(({ initSocket }) => {
    try {
      initSocket(server);
      console.log("Socket.IO initialized");
    } catch (err) {
      console.error("Failed to initialize Socket.IO:", err);
    }
  }).catch(err => console.error("Socket.IO import failed:", err));
}

// Export for Vercel serverless
export default app;