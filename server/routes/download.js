import express from "express";
import {
  canDownload,
  recordDownload,
  getUserDownloads,
  deleteDownload,
} from "../controller/download.js";

const router = express.Router();

// Check if user can download
router.get("/can-download/:userId", canDownload);

// Record a download
router.post("/record", recordDownload);

// Get user's downloads
router.get("/user/:userId", getUserDownloads);

// Delete a download record
router.delete("/:downloadId", deleteDownload);

export default router;
