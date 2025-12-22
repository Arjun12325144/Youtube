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
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.json({ 
    status: "success",
    message: "YouTube Clone API is running",
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

// MongoDB connection with caching for serverless
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  try {
    const DBURL = process.env.DB_URL;
    const connection = await mongoose.connect(DBURL, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    cachedDb = connection;
    console.log("MongoDB connected successfully");
    return connection;
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    throw error;
  }
}

// Connect on startup
connectToDatabase().catch(err => console.error("Initial DB connection failed:", err));

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