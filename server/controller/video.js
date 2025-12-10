import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import video from "../Models/video.js";

const uploadsDir = path.join(process.cwd(), "uploads");

export const uploadvideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message:
          "No file uploaded or invalid file type. Please upload a video file (MP4/WebM/MOV/AVI).",
      });
    }

    if (!req.body.videotitle || !req.body.videochanel) {
      return res.status(400).json({
        message: "Missing required fields. Please provide video title and channel.",
      });
    }

    // Use uploader from request body if provided, otherwise use a placeholder
    // In a production app with auth, you'd extract this from a JWT token
    let uploader = req.body.uploader;
    if (!uploader || uploader.length !== 24) {
      // If uploader is not a valid MongoDB ObjectId, try to use it as a channel name
      // (for backward compatibility with old uploads)
      uploader = req.body.uploader || "unknown";
    }

    // Build video metadata from the uploaded file and normalize the filepath to a web URL
    const filename = path.basename(req.file.path);
    const webPath = path.join("/uploads", filename).replace(/\\/g, "/");

    const fileMeta = {
      videotitle: req.body.videotitle,
      filename: req.file.originalname,
      filepath: webPath,
      filetype: req.file.mimetype,
      filesize: req.file.size,
      videochanel: req.body.videochanel,
      uploader: uploader,
      description: req.body.description || "",
    };

    // Attempt to persist to DB only if mongoose is connected
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      try {
        const doc = new video(fileMeta);
        await doc.save();
        // Ensure we return the web path (not the original server filesystem path)
        const responsePath = doc.filepath || fileMeta.filepath;
        return res.status(201).json({
          message: "File uploaded and saved to database successfully",
          video: { id: doc._id, title: doc.videotitle, path: responsePath },
        });
      } catch (dbErr) {
        console.error("Video DB save error:", dbErr);
        // fallthrough to return a partial success below
      }
    }

    // If DB is not available or save failed, still return success for file stored on disk
    const fallbackVideo = {
      id: null,
      title: fileMeta.videotitle,
      path: fileMeta.filepath,
      note: "File saved to disk but database is currently unavailable.",
    };

    return res.status(201).json({ message: "File uploaded (disk only)", video: fallbackVideo });
  } catch (error) {
    console.error("Video upload error:", error);
    return res.status(500).json({ message: "Error uploading video", error: error.message });
  }
};

export const getallvideo = async (req, res) => {
  try {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      const files = await video.find().lean();
      // Normalize any stored filepath values to web-friendly paths
      const normalized = (files || []).map((f) => {
        const name = path.basename(f.filepath || "");
        return { ...f, filepath: path.join("/uploads", name).replace(/\\/g, "/") };
      });
      return res.status(200).json(normalized);
    }

    // DB is not available — fallback: list files from uploads folder
    if (!fs.existsSync(uploadsDir)) {
      return res.status(200).json([]);
    }

    const filesOnDisk = fs.readdirSync(uploadsDir).map((fname) => {
      return {
        _id: null,
        videotitle: fname,
        filename: fname,
        filepath: path.join("/uploads", fname).replace(/\\/g, "/"),
        filetype: null,
        filesize: null,
        videochanel: null,
        uploader: null,
        note: "Listed from disk because database is unavailable",
      };
    });

    return res.status(200).json(filesOnDisk);
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getVideosByUploader = async (req, res) => {
  try {
    const { uploaderId } = req.params;

    // Validate that uploaderId is a valid MongoDB ObjectId
    if (!uploaderId || uploaderId.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(uploaderId)) {
      return res.status(400).json({ message: "Invalid uploader ID format" });
    }

    if (mongoose.connection && mongoose.connection.readyState === 1) {
      // Query videos by uploader ObjectId
      const files = await video.find({ uploader: uploaderId }).lean();
      
      // Normalize filepath values
      const normalized = (files || []).map((f) => {
        const name = path.basename(f.filepath || "");
        return { ...f, filepath: path.join("/uploads", name).replace(/\\/g, "/") };
      });
      
      return res.status(200).json(normalized);
    }

    // If DB is not available, return empty list
    return res.status(200).json([]);
  } catch (error) {
    console.error("Error fetching videos by uploader:", error);
    return res.status(500).json({ message: "Error fetching videos", error: error.message });
  }
};

export const updateVideo = async (req, res) => {
  try {
    const videoId = req.params.id;
    const { description, uploader } = req.body;

    if (!videoId || videoId.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(videoId)) {
      return res.status(400).json({ message: "Invalid video id" });
    }

    if (typeof description !== "string") {
      return res.status(400).json({ message: "Invalid description" });
    }

    if (mongoose.connection && mongoose.connection.readyState === 1) {
      const vid = await video.findById(videoId);
      if (!vid) return res.status(404).json({ message: "Video not found" });

      // If uploader is provided, enforce that it matches the stored uploader (basic authorization)
      if (uploader && String(vid.uploader) !== String(uploader)) {
        return res.status(403).json({ message: "Not authorized to update this video" });
      }

      vid.description = description;
      await vid.save();

      return res.status(200).json({ message: "Video updated", video: vid });
    }

    return res.status(503).json({ message: "Database unavailable" });
  } catch (error) {
    console.error("Error updating video:", error);
    return res.status(500).json({ message: "Error updating video", error: error.message });
  }
};