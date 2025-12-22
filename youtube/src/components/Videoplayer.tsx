// import React, {useRef} from "react";
// const Videoplayer = ({video}:any)=>{
//     const videos = "/video/vdo.mp4"
//     const videoRef = useRef<HTMLVideoElement>(null);
 
//     return(
//         <div className='aspect-video bg-black rounded-lg overflow-hidden'>
//             <video ref={videoRef} className='w-full h-full' controls>
//                 <source src={videos} type="video/mp4" />
//                 Your browser does not support the video tag.
//             </video>
//         </div>

//     )
// }
// export default Videoplayer;
"use client";

import { useRef, useEffect, useState } from "react";

interface VideoPlayerProps {
  video: {
    _id: string;
    videotitle: string;
    filepath: string;
    filetype?: string;
    thumbnailUrl?: string;
  };
}

export default function VideoPlayer({ video }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasError, setHasError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Check if filepath is already a full URL (Cloudinary) or needs backend prefix
  const filepath = video?.filepath || "";
  const isFullUrl = filepath.startsWith("http://") || filepath.startsWith("https://");
  
  const base = (
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"
  ).replace(/\/+$/, "");
  
  const src = isFullUrl 
    ? filepath 
    : `${base}${filepath.startsWith("/") ? filepath : "/" + filepath}`;

  const posterUrl = video?.thumbnailUrl || `/placeholder.svg?height=480&width=854`;

  useEffect(() => {
    setHasError(false);
    setLoaded(false);
  }, [src]);

  return (
    <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
      {!loaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center text-white">
          Loading video...
        </div>
      )}

      {hasError ? (
        <div className="w-full h-full flex items-center justify-center text-white">
          <div className="text-center p-4">
            <div className="font-semibold">Unable to load video</div>
            <div className="text-sm text-gray-400">The video may be processing or unavailable.</div>
          </div>
        </div>
      ) : (
        <video
          key={video?._id}
          ref={videoRef}
          className="w-full h-full"
          controls
          poster={posterUrl}
          onError={(e) => {
            console.error("Video element error:", e, "src:", src);
            setHasError(true);
          }}
          onLoadedMetadata={() => setLoaded(true)}
        >
          <source src={src} type={video?.filetype || "video/mp4"} />
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  );
}