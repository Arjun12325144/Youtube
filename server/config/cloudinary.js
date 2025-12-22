import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload video to Cloudinary
export const uploadVideo = async (filePath, folder = "youtube-clone/videos") => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "video",
      folder: folder,
      chunk_size: 6000000, // 6MB chunks for large videos
      eager: [
        { format: "mp4", transformation: [{ quality: "auto" }] }
      ],
      eager_async: true,
    });
    return {
      url: result.secure_url,
      publicId: result.public_id,
      duration: result.duration,
      format: result.format,
    };
  } catch (error) {
    console.error("Cloudinary video upload error:", error);
    throw error;
  }
};

// Upload image/thumbnail to Cloudinary
export const uploadImage = async (filePath, folder = "youtube-clone/thumbnails") => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "image",
      folder: folder,
      transformation: [
        { width: 1280, height: 720, crop: "limit" },
        { quality: "auto" }
      ],
    });
    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error("Cloudinary image upload error:", error);
    throw error;
  }
};

// Upload from buffer (for serverless)
export const uploadFromBuffer = async (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      resource_type: options.resourceType || "auto",
      folder: options.folder || "youtube-clone",
      ...options,
    };

    cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) {
        console.error("Cloudinary buffer upload error:", error);
        reject(error);
      } else {
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          duration: result.duration,
          format: result.format,
        });
      }
    }).end(buffer);
  });
};

// Delete from Cloudinary
export const deleteFromCloudinary = async (publicId, resourceType = "video") => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw error;
  }
};

// Generate video thumbnail from Cloudinary video
export const generateThumbnail = (publicId) => {
  return cloudinary.url(publicId, {
    resource_type: "video",
    format: "jpg",
    transformation: [
      { width: 640, height: 360, crop: "fill" },
      { start_offset: "2" } // Get thumbnail from 2 seconds into video
    ],
  });
};

export default cloudinary;
