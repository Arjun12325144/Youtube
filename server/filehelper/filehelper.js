"use strict";
import multer from "multer";
import path from "path";
import fs from "fs";

// Create uploads directory if it doesn't exist (only in non-serverless environment)
const uploadsDir = path.join(process.cwd(), "uploads");
try {
  if (!process.env.VERCEL && !fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch (error) {
  console.log("Skipping uploads directory creation (serverless environment)");
}

// Use memory storage for Vercel (upload to Cloudinary), disk storage for local
const storage = process.env.VERCEL 
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, uploadsDir);
      },
      filename: (req, file, cb) => {
        cb(
          null,
          new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname
        );
      },
    });

const filefilter = (req, file, cb) => {
  // Accept video and image files
  if (file.mimetype && (file.mimetype.startsWith("video/") || file.mimetype.startsWith("image/"))) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: filefilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit for Vercel
});

export default upload;