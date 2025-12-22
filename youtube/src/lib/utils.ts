import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Cloudinary cloud name for video URLs
const CLOUDINARY_CLOUD_NAME = "dl5jvvlk9";

// Helper to get the correct video URL from a video object
export function getVideoUrl(video: { cloudinaryPublicId?: string; filepath?: string }): string {
  // If video has cloudinaryPublicId, construct the Cloudinary URL directly
  if (video.cloudinaryPublicId) {
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload/${video.cloudinaryPublicId}.mp4`;
  }
  // If filepath is already a full URL, use it
  if (video.filepath?.startsWith("http")) {
    return video.filepath;
  }
  // Fallback to backend URL for old local uploads
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
  return `${backendUrl}${video.filepath || ""}`;
}

// Helper to get the correct thumbnail URL from a video object
export function getThumbnailUrl(video: { cloudinaryPublicId?: string; thumbnailUrl?: string; thumbnail?: string }): string {
  // If video has thumbnailUrl, use it
  if (video.thumbnailUrl) {
    return video.thumbnailUrl;
  }
  // If video has cloudinaryPublicId, generate thumbnail URL
  if (video.cloudinaryPublicId) {
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload/c_fill,h_360,w_640/so_2/${video.cloudinaryPublicId}.jpg`;
  }
  // If thumbnail is a full URL, use it
  if (video.thumbnail?.startsWith("http")) {
    return video.thumbnail;
  }
  // Fallback placeholder
  return "/video/placeholder.jpg";
}