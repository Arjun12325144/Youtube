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
  };
}

export default function VideoPlayer({ video }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const videos = "/video/vdo.mp4";
  const [hasError, setHasError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const base = (
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"
  ).replace(/\/+$/, "");
  const filepath = video?.filepath || "";
  const src = `${base}${filepath.startsWith("/") ? filepath : "/" + filepath}`;

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
          <div>
            <div className="font-semibold">Unable to load video</div>
            <div className="text-sm">Check server is running and video file exists.</div>
            <div className="text-xs mt-2">Source: {src}</div>
          </div>
        </div>
      ) : (
        <video
          key={video?._id}
          ref={videoRef}
          className="w-full h-full"
          controls
          poster={`/placeholder.svg?height=480&width=854`}
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