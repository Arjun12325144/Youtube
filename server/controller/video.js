import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import video from "../Models/video.js";
import cloudinary, { uploadFromBuffer, deleteFromCloudinary, generateThumbnail } from "../config/cloudinary.js";

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
    let uploader = req.body.uploader;
    if (!uploader || uploader.length !== 24) {
      uploader = req.body.uploader || "unknown";
    }

    let videoUrl, cloudinaryPublicId, thumbnailUrl;

    // Check if running on Vercel (serverless) - use Cloudinary
    if (process.env.VERCEL || process.env.USE_CLOUDINARY === "true") {
      try {
        // Upload to Cloudinary from buffer
        const cloudinaryResult = await uploadFromBuffer(req.file.buffer, {
          resourceType: "video",
          folder: "youtube-clone/videos",
        });
        
        videoUrl = cloudinaryResult.url;
        cloudinaryPublicId = cloudinaryResult.publicId;
        thumbnailUrl = generateThumbnail(cloudinaryResult.publicId);
      } catch (cloudError) {
        console.error("Cloudinary upload error:", cloudError);
        return res.status(500).json({ 
          message: "Error uploading to cloud storage", 
          error: cloudError.message 
        });
      }
    } else {
      // Local storage - use disk path
      const filename = path.basename(req.file.path);
      videoUrl = path.join("/uploads", filename).replace(/\\/g, "/");
      cloudinaryPublicId = null;
      thumbnailUrl = null;
    }

    const fileMeta = {
      videotitle: req.body.videotitle,
      filename: req.file.originalname,
      filepath: videoUrl,
      filetype: req.file.mimetype,
      filesize: req.file.size,
      videochanel: req.body.videochanel,
      uploader: uploader,
      description: req.body.description || "",
      cloudinaryPublicId: cloudinaryPublicId,
      thumbnailUrl: thumbnailUrl,
    };

    // Attempt to persist to DB
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      try {
        const doc = new video(fileMeta);
        await doc.save();
        return res.status(201).json({
          message: "Video uploaded successfully",
          video: { 
            id: doc._id, 
            title: doc.videotitle, 
            path: doc.filepath,
            thumbnail: doc.thumbnailUrl 
          },
        });
      } catch (dbErr) {
        console.error("Video DB save error:", dbErr);
      }
    }

    // Fallback response
    return res.status(201).json({ 
      message: "Video uploaded", 
      video: {
        title: fileMeta.videotitle,
        path: fileMeta.filepath,
      }
    });
  } catch (error) {
    console.error("Video upload error:", error);
    return res.status(500).json({ message: "Error uploading video", error: error.message });
  }
};

export const getallvideo = async (req, res) => {
  try {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      const files = await video.find().lean();
      // Normalize filepath - generate Cloudinary URLs for videos with cloudinaryPublicId
      const normalized = (files || []).map((f) => {
        const filepath = f.filepath || "";
        
        // If it's already a full URL (Cloudinary), don't modify it
        if (filepath.startsWith("http://") || filepath.startsWith("https://")) {
          return { ...f };
        }
        
        // If video has cloudinaryPublicId, generate the Cloudinary URL
        if (f.cloudinaryPublicId) {
          const cloudinaryUrl = cloudinary.url(f.cloudinaryPublicId, {
            resource_type: "video",
            format: "mp4",
          });
          return { ...f, filepath: cloudinaryUrl };
        }
        
        // For local files (old videos), normalize to web-friendly path
        // These won't work on Vercel but will work locally
        const name = path.basename(filepath);
        return { ...f, filepath: `/uploads/${name}` };
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
      
      // Normalize filepath - generate Cloudinary URLs for videos with cloudinaryPublicId
      const normalized = (files || []).map((f) => {
        const filepath = f.filepath || "";
        
        // If it's already a full URL (Cloudinary), don't modify it
        if (filepath.startsWith("http://") || filepath.startsWith("https://")) {
          return { ...f };
        }
        
        // If video has cloudinaryPublicId, generate the Cloudinary URL
        if (f.cloudinaryPublicId) {
          const cloudinaryUrl = cloudinary.url(f.cloudinaryPublicId, {
            resource_type: "video",
            format: "mp4",
          });
          return { ...f, filepath: cloudinaryUrl };
        }
        
        // For local files, normalize to web-friendly path
        const name = path.basename(filepath);
        return { ...f, filepath: `/uploads/${name}` };
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