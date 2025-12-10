// import React,{useState,useEffect} from 'react';
// import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
// import { Button } from './ui/button';
// import { formatDistanceToNow } from "date-fns";
// import { Download, MoreHorizontal, Share, ThumbsDown, ThumbsUp } from 'lucide-react';
// const VideoInfo = ({video}:any)=>{
 
//     const [likes,setLikes] = useState(video.like || 0);
//     const [dislikes,setDislike] = useState(video.dislike || 0);
//     const [isLiked,setIsLiked] = useState(false);
//     const [isDisliked,setIsDisliked] = useState(false); 
//     const[showFullDescription, setShowFullDescription] = useState(false);

//     const user :any = {
//         id:"1",
//         name:"john",
//         email:"sncj@gmial.com",
//         image:"https://images.pexels.com"

//     };
//     useEffect(()=>{
//         setLikes(video.Like||0);
//         setDislike(video.Dislike||0);

//         setIsLiked(false);
//         setIsDisliked(false);
//     },[video])
//     const handleLike = ()=>{
//         if(!user){
//             return;
//         }
//         if(isLiked){
//             setLikes((prev:any)=>prev-1);
//             setIsLiked(false);
//         }else{
//             setLikes((prev:any)=>prev+1);
//             setIsLiked(true);
//             if(isDisliked){
//                 setDislike((prev:any) => prev-1);
//                 setIsDisliked(false);
            
//             }

//         }
//     }
//     const handleDislike = ()=>{
//         if(!user){
//             return;
//         }
//         if(isDisliked){
//             setDislike((prev:any)=>prev-1);
//             setIsDisliked(false);
            
//         }else{
//             setDislike((prev:any)=>prev+1);
//             setIsDisliked(true);
//             if(isLiked){
//                 setLikes((prev:any) => prev-1);
//                 setIsLiked(false);
//             }
//         }

//     }
//     return(
//         <div className='space-y-4   '>
//             <h1 className='text-xl font-semibold'>{video.videotitle}</h1>
//             <div className='flex items-center justify-between'>
//                 <div className='flex items-center gap-2 whitespace-nowrap'>
//                     <Avatar className='w-10 h-10'>
                        
//                         <AvatarFallback>  {video.videochannel[0]} </AvatarFallback>
//                     </Avatar>
//                     <div >
//                         <h3 className='font-medium'> {video.videochannel} </h3>
//                         <p className='text-sm text-gray-600'>1.3M subscribers</p>
//                     </div>
//                     <Button className='mr-2'>Subcribe</Button>
//                 </div>   
//                 <div className="flex items-center gap-2">
//                     <div className='flex items-center bg-gray-100 rounded-full"'>
//                         <Button variant="ghost"  size="sm" className="rounded-l-full" onClick={handleLike}>
//                             <ThumbsUp className={`w-5 h-5 mr-2 ${isLiked?"fill-black text-black":""}`}/> {likes.toLocaleString()}
//                         </Button>
//                          <div className="w-px h-6 bg-gray-300" />
//                         <Button variant="ghost" size="sm" className="rounded-r-full" onClick={handleDislike}>
//                             <ThumbsDown className={`w-5 h-5 mr-2 ${isDisliked?"fill-black text-black":""}`}/> {dislikes.toLocaleString()}
//                         </Button>
//                     </div>
//                     <Button variant="ghost" size="sm" className='bg-gray-100 rounded-full'>
//                         <Share className='w-5 h-5 mr-2' />Share
//                     </Button>
//                     <Button variant="ghost" size="sm" className='bg-gray-100 rounded-full'>
//                         <Download className='w-5 h-5 mr-2'/>Download
//                     </Button>
//                     <Button variant="ghost" size="icon" className='bg-gray-100 rounded-full'>
//                         <MoreHorizontal className='w-5 h-5' />
//                     </Button>
//                 </div>
//             </div>
//             <div className='bg-gray-100 rounded-lg p-4'>
//                 <div className='flex gap-4 text-sm font-medium mb-2'>
//                     <span> {video.views.toLocaleString()} views </span>
//                     <span> {formatDistanceToNow(new Date(video.createdAt))} ago </span>
//                 </div>
//                 <div className={`text-sm ${showFullDescription?"":"line-clamp-3"}`}>
//                     <p>Sample video description this would contain  </p>
//                 </div>
//                 <Button variant="ghost" size="sm" onClick={()=>setShowFullDescription(!showFullDescription)}>
//                     {showFullDescription?"show less":"show more"}
//                 </Button>
//             </div>
//         </div>
//     )
// }
// export default VideoInfo;
import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  Clock,
  Download,
  MoreHorizontal,
  Share,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { getSocket } from "@/lib/socket";

const VideoInfo = ({ video }: any) => {
  const [likes, setlikes] = useState(video.Like || 0);
  const [dislikes, setDislikes] = useState(video.Dislike || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [descriptionText, setDescriptionText] = useState<string>(video.description || "");
  const { user } = useUser();
  const [isWatchLater, setIsWatchLater] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);

  // const user: any = {
  //   id: "1",
  //   name: "John Doe",
  //   email: "john@example.com",
  //   image: "https://github.com/shadcn.png?height=32&width=32",
  // };
  useEffect(() => {
    setlikes(video.Like || 0);
    setDislikes(video.Dislike || 0);
    setIsLiked(false);
    setIsDisliked(false);
    setDescriptionText(video.description || "");

    // Load subscription status and count for the uploader
    const loadSubInfo = async () => {
      // Guard: uploader must be a valid MongoDB ObjectId (24 hex chars)
      if (!video?.uploader || video.uploader.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(video.uploader)) {
        console.warn("Invalid uploader ID format:", video?.uploader);
        setSubscriberCount(null);
        return;
      }
      try {
        // Get subscriber count
        const cntRes = await axiosInstance.get(`/subscribe/count/${video.uploader}`);
        setSubscriberCount(cntRes.data.count || 0);

        // Check if current user is subscribed
        if (user && user._id) {
          const checkRes = await axiosInstance.get(
            `/subscribe/check/${video.uploader}/${user._id}`
          );
          setIsSubscribed(!!checkRes.data.subscribed);
        }
      } catch (err) {
        console.error("Failed to load subscription info:", err);
        setSubscriberCount(null);
      }
    };
    loadSubInfo();
  }, [video, user]);

  useEffect(() => {
    const handleviews = async () => {
      if (user) {
        try {
          return await axiosInstance.post(`/history/${video._id}`, {
            userId: user?._id,
          });
        } catch (error) {
          return console.log(error);
        }
      } else {
        return await axiosInstance.post(`/history/views/${video?._id}`);
      }
    };
    handleviews();
  }, [user]);

  // Initialize watch-later state by checking the user's saved list
  useEffect(() => {
    if (!user || !video?._id) return;
    let mounted = true;
    const checkWatchLater = async () => {
      try {
        const res = await axiosInstance.get(`/watch/${user._id}`);
        const list = Array.isArray(res.data) ? res.data : [];
        const found = list.some((it: any) => {
          const vid = it?.videoid;
          return vid && (vid._id === video._id || vid === video._id);
        });
        if (mounted) setIsWatchLater(found);
      } catch (err) {
        console.error("Failed to check watch later status:", err);
      }
    };
    checkWatchLater();
    return () => {
      mounted = false;
    };
  }, [user, video?._id]);

  // Listen for realtime subscription updates
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handler = (data: any) => {
      if (!data || data.channelId !== video?.uploader) return;

      // Update subscriber count
      setSubscriberCount((prev) => {
        const delta = data.subscribed ? 1 : -1;
        const base = typeof prev === "number" ? prev : 0;
        return Math.max(0, base + delta);
      });

      // Update current user's subscription status
      if (user && data.subscriber === user._id) {
        setIsSubscribed(!!data.subscribed);
      }
    };

    socket.on("subscriptionToggled", handler);
    return () => {
      socket.off("subscriptionToggled", handler);
    };
  }, [video?.uploader, user]);

  const handleSubscribe = async () => {
    if (!user) return;
    // Guard: uploader must be a valid MongoDB ObjectId
    if (!video?.uploader || video.uploader.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(video.uploader)) {
      console.warn("Invalid uploader ID format:", video?.uploader);
      return;
    }
    try {
      const res = await axiosInstance.post(`/subscribe/${video.uploader}`, {
        subscriber: user._id,
      });
      if (res.data && typeof res.data.subscribed !== "undefined") {
        setIsSubscribed(!!res.data.subscribed);
      }
    } catch (err) {
      console.error("Failed to toggle subscription:", err);
    }
  };

  const handleLike = async () => {
    if (!user) return;
    try {
      const res = await axiosInstance.post(`/like/${video._id}`, {
        userId: user?._id,
      });
      if (res.data.liked) {
        if (isLiked) {
          setlikes((prev: any) => prev - 1);
          setIsLiked(false);
        } else {
          setlikes((prev: any) => prev + 1);
          setIsLiked(true);
          if (isDisliked) {
            setDislikes((prev: any) => prev - 1);
            setIsDisliked(false);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleWatchLater = async () => {
    try {
      const res = await axiosInstance.post(`/watch/${video._id}`, {
        userId: user?._id,
      });
      // server returns { watchlater: true } when saved, false when removed
      setIsWatchLater(Boolean(res.data?.watchlater));
    } catch (error) {
      console.log(error);
    }
  };
  const handleDislike = async () => {
    if (!user) return;
    try {
      const res = await axiosInstance.post(`/like/${video._id}`, {
        userId: user?._id,
      });
      if (!res.data.liked) {
        if (isDisliked) {
          setDislikes((prev: any) => prev - 1);
          setIsDisliked(false);
        } else {
          setDislikes((prev: any) => prev + 1);
          setIsDisliked(true);
          if (isLiked) {
            setlikes((prev: any) => prev - 1);
            setIsLiked(false);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const startEdit = () => {
    if (!user) return;
    // Only uploader can edit description (best-effort check)
    if (video?.uploader && String(user._id) !== String(video.uploader)) return;
    setIsEditingDescription(true);
  };

  const saveDescription = async () => {
    if (!user) return;
    try {
      const payload = { description: descriptionText, uploader: user._id };
      const res = await axiosInstance.put(`/video/${video._id}`, payload);
      if (res?.data?.video) {
        // update local UI
        setIsEditingDescription(false);
      }
    } catch (err) {
      console.error("Failed to save description:", err);
      // keep editing mode open for retry
    }
  };
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">{video.videotitle}</h1>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="w-10 h-10">
            <AvatarFallback>{video.videochanel[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{video.videochanel}</h3>
            <p className="text-sm text-gray-600">
              {subscriberCount !== null ? subscriberCount.toLocaleString() : "1.2M"} subscribers
            </p>
          </div>
          {/* Only show Subscribe button if uploader is a valid MongoDB ObjectId */}
          {video?.uploader && video.uploader.length === 24 && /^[0-9a-fA-F]{24}$/.test(video.uploader) && (
            <Button
              onClick={handleSubscribe}
              variant={isSubscribed ? "outline" : "default"}
              className={
                isSubscribed ? "bg-gray-100" : "bg-red-600 hover:bg-red-700"
              }
            >
              {isSubscribed ? "Subscribed" : "Subscribe"}
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-100 rounded-full">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-l-full"
              onClick={handleLike}
            >
              <ThumbsUp
                className={`w-5 h-5 mr-2 ${
                  isLiked ? "fill-black text-black" : ""
                }`}
              />
              {likes.toLocaleString()}
            </Button>
            <div className="w-px h-6 bg-gray-300" />
            <Button
              variant="ghost"
              size="sm"
              className="rounded-r-full"
              onClick={handleDislike}
            >
              <ThumbsDown
                className={`w-5 h-5 mr-2 ${
                  isDisliked ? "fill-black text-black" : ""
                }`}
              />
              {dislikes.toLocaleString()}
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className={`bg-gray-100 rounded-full ${
              isWatchLater ? "text-primary" : ""
            }`}
            onClick={handleWatchLater}
          >
            <Clock className="w-5 h-5 mr-2" />
            {isWatchLater ? "Saved" : "Watch Later"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="bg-gray-100 rounded-full"
          >
            <Share className="w-5 h-5 mr-2" />
            Share
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="bg-gray-100 rounded-full"
          >
            <Download className="w-5 h-5 mr-2" />
            Download
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="bg-gray-100 rounded-full"
          >
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>
      </div>
      <div className="bg-gray-100 rounded-lg p-4">
        <div className="flex gap-4 text-sm font-medium mb-2">
          <span>{video.views.toLocaleString()} views</span>
          <span>{formatDistanceToNow(new Date(video.createdAt))} ago</span>
        </div>
        <div className={`text-sm ${showFullDescription ? "" : "line-clamp-3"}`}>
          {!isEditingDescription ? (
            <p>{descriptionText || "No description provided."}</p>
          ) : (
            <textarea
              className="w-full p-2 border rounded-md text-sm"
              rows={6}
              value={descriptionText}
              onChange={(e) => setDescriptionText(e.target.value)}
            />
          )}
        </div>

        <div className="mt-2 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-auto font-medium"
            onClick={() => setShowFullDescription(!showFullDescription)}
          >
            {showFullDescription ? "Show less" : "Show more"}
          </Button>

          {/* Edit controls: only show edit button to uploader */}
          {!isEditingDescription && user && video?.uploader && String(user._id) === String(video.uploader) && (
            <Button variant="outline" size="sm" onClick={startEdit}>
              Edit description
            </Button>
          )}

          {isEditingDescription && (
            <>
              <Button size="sm" onClick={saveDescription}>
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setIsEditingDescription(false)}>
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoInfo;