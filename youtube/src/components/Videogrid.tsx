"use client";

import { useEffect, useState } from "react";
import VideoCard from "./Videocard";
import axiosInstance from "@/lib/axiosinstance";
import { AlertCircle, RefreshCw } from "lucide-react";

interface VideogridProps {
  filterCategory?: string;
}

export default function Videogrid({ filterCategory }: VideogridProps) {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosInstance.get("/video/getall");
      let list = res.data || [];
      
      if (filterCategory && filterCategory !== "All") {
        const cat = filterCategory.toLowerCase();
        list = list.filter((v: any) => {
          return (
            (v.videotitle && v.videotitle.toLowerCase().includes(cat)) ||
            (v.videochanel && v.videochanel.toLowerCase().includes(cat))
          );
        });
      }
      
      setVideos(list);
    } catch (err) {
      console.error(err);
      setError("Failed to load videos. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [filterCategory]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-video rounded-xl skeleton mb-3" />
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-full skeleton flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 rounded skeleton" />
                <div className="h-4 rounded skeleton w-3/4" />
                <div className="h-3 rounded skeleton w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h3 className="text-xl font-semibold text-[var(--color-foreground)] mb-2">
          Something went wrong
        </h3>
        <p className="text-[var(--color-muted-foreground)] mb-4">{error}</p>
        <button
          onClick={fetchVideos}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-full hover:bg-red-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try again
        </button>
      </div>
    );
  }

  // Empty state
  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-32 h-32 mb-6 rounded-full bg-[var(--color-secondary)] flex items-center justify-center">
          <svg className="w-16 h-16 text-[var(--color-muted-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-[var(--color-foreground)] mb-2">
          No videos found
        </h3>
        <p className="text-[var(--color-muted-foreground)] text-center max-w-md">
          {filterCategory && filterCategory !== "All"
            ? `No videos found for "${filterCategory}". Try a different category.`
            : "Be the first to upload a video and share it with the world!"}
        </p>
      </div>
    );
  }

  // Video grid
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
      {videos.map((video: any) => (
        <VideoCard key={video._id} video={video} />
      ))}
    </div>
  );
}
