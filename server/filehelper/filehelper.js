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

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // For serverless, use /tmp directory
    const destDir = process.env.VERCEL ? "/tmp" : uploadsDir;
    cb(null, destDir);
  },
  filename: (req, file, cb) => {
    cb(
      null,
      new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname
    );
  },
});
const filefilter = (req, file, cb) => {
  // Accept any video/* mime type (mp4, webm, quicktime/mov, avi, etc.)
  if (file.mimetype && file.mimetype.startsWith("video/")) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: filefilter,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB limit
});
export default upload;