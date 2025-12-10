// import { Clock, MoreVertical, X,Play } from "lucide-react";
// import Link from "next/link";
// import { Suspense,useEffect,useState } from "react";
// import {formatDistanceToNow} from 'date-fns'
// import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
// import { Button } from "./ui/button";
// import { DropdownMenuContent } from "@radix-ui/react-dropdown-menu";
// interface WatchLaterItem{
//     _id:string;
//     videoid:string;
//     viewer:string;
//     watchedon:string;
//     video:{
//         _id:string;
//         videotitle:string;
//         videochannel:string;
//         views:number;
//         createdAt:string;
//     }
// }
// const videos = "/video/vdo.mp4"
// const WatchLaterContent = ()=>{
//     const user:any = {
//         id:"1",
//         name:"john",
//         email:"bnrnb",
//         image:"#",
//     }
//     const[watchLater, setWatchLater] = useState<WatchLaterItem[]>([]);
//     const [loading,setLoading] = useState(true);
//     useEffect(()=>{
//         const userId = user?.id;
//         if(userId){
//             loadWatchLater();
//         }
//     },[user?.id]); // Use a stable value like user.id as a dependency
//     const loadWatchLater = async()=>{
//         if(!user)return;
//         try{
//             const watchLaterData=[
//                 {
//                     _id:"h1",
//                     videoid:"1",
//                     viewer:user.id,
//                     watchedon:new Date(Date.now() - 3600000).toISOString(),
//                     video:{
//                         _id:"1",
//                         videotitle:"Amaxing",
//                         videochannel:"natural channel",
//                         views:4022,
//                         createdAt:new Date().toISOString()
//                     }
//                 },
//                 {
//                     _id:"h2",
//                     videoid:"2",
//                     viewer:user.id,
//                     watchedon:new Date(Date.now() - 3600000).toISOString(),
//                     video:{
//                         _id:"1",
//                         videotitle:"cooking",
//                         videochannel:"cooking channel",
//                         views:42,
//                         createdAt:new Date().toISOString()
//                     }
//                 },

                

 
//              ]
//              setWatchLater(watchLaterData);
//         }catch(err){
//             console.log(err);
//         }finally{
//             setLoading(false);
//         }
//     }
//     const handleRemoveFromWatchLater = async(historyId:string)=>{
//         try{
//             console.log("removing history");
//             setWatchLater(watchLater.filter(item=>item._id !== historyId))
//         }catch(err){
//             console.log(err);
//         }
//     }
//     if(!user){
//         return (
//             <div>
//             <Clock className='w-6 h-6' />
//             <h2>Save videos for later</h2>
//             <p>Sign in to access your Watch later playlist.
// </p>
//         </div>
//         )
//     }
//     if(loading){
//         return <div>Loading...</div>

//     }
//     if(history.length===0){
//          return (
//             <div className="text-center py-12">
//                 <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
//                 <h2 className="text-xl font-semibold mb-2">No videos saved</h2>
//                 <p className="text-gray-600">Videos you save for later will appear here.</p>
//             </div>
//     );
//     }
//     return (
//         <div className="space-y-4">
//             <div className="flex justify-between items-center">
//                 <p className="text-sm text-gray-600">{watchLater.length} videos</p>
//                 <Button className="flex items-center gap-2">
//           <Play className="w-4 h-4" />
//           Play all
//         </Button>
//             </div>
//             <div className="space-y-4">
//                 {watchLater.map((item)=>(
//                     <div className="flex gap-4 group">
//                     <Link href={`/watch/${item.video._id}`} key={item._id} className="flex-shrink-0">
//                         <div className="relative w-40 aspect-video bg-gray-100 rounded overflow-hidden">
//                             <video className='object-cover group-hover:scale-105 transition-transform duration-200' src={videos}   />
//                         </div>
//                     </Link>
//                     <div className="flex-1 min-w-0">
//                         <Link href={`/watch/${item.video._id}`} key={item._id} className='group'>
//                         <h3  className="font-medium text-sm line-clamp-2 group-hover:text-blue-600 mb-1"> {item.video.videotitle} </h3>
//                         </Link>
//                         <p className="text-sm text-gray-600">{item.video.views.toLocaleString()} views 
//                             {formatDistanceToNow(new Date(item.video.createdAt))}
//                         </p>
//                         <p className="text-sm text-gray-600">Watched {formatDistanceToNow(new Date(item.watchedon))} </p>
                         
                    
//                     </div>
//                     <DropdownMenu>
//                         <DropdownMenuTrigger asChild>
//                             <Button variant="ghost" size="icon"  className="opacity-0 group-hover:opacity-100">
//                                 <MoreVertical className="w-4 h-4" />
//                             </Button>
//                         </DropdownMenuTrigger>
//                          <DropdownMenuContent align="end">
//                             <DropdownMenuItem onClick={()=>  handleRemoveFromWatchLater(item._id)}>
//                                 <X className="w-4 h-4 mr-2" />
//                             </DropdownMenuItem>
//                          </DropdownMenuContent>
//                     </DropdownMenu>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     )
// }
// export default WatchLaterContent
"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import Videocard from "./Videocard";
import { Clock, Play, X } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

interface WatchLaterItem {
  _id: string;
  viewer: string;
  videoid: any; // populated video document
  createdAt?: string;
}

export default function WatchLaterContent() {
  const { user } = useUser();
  const [items, setItems] = useState<WatchLaterItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!user?. _id) {
      setLoading(false);
      return;
    }
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/watch/${user._id}`);
        if (!mounted) return;
        // server returns array of watchlater docs with populated videoid
        setItems(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to load watch later:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [user?._id]);

  const handleRemove = async (videoId: string) => {
    if (!user?._id) return;
    try {
      await axiosInstance.post(`/watch/${videoId}`, { userId: user._id });
      setItems((s) => s.filter((it) => it.videoid?._id !== videoId));
    } catch (err) {
      console.error("Failed to remove from watch later:", err);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Save videos for later</h2>
        <p className="text-gray-600">Sign in to access your Watch later playlist.</p>
      </div>
    );
  }

  if (loading) return <div>Loading...</div>;

  if (items.length === 0)
    return (
      <div className="text-center py-12">
        <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold mb-2">No videos saved</h2>
        <p className="text-gray-600">Videos you save for later will appear here.</p>
      </div>
    );

  // Map to video objects for reuse with Videocard
  const videos = items.map((it) => it.videoid).filter(Boolean);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-600">{videos.length} videos</p>
        <Button className="flex items-center gap-2">
          <Play className="w-4 h-4" />
          Play all
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {videos.map((video: any) => (
          <div key={video._id} className="relative group">
            <Videocard video={video} />
            <button
              onClick={() => handleRemove(video._id)}
              className="absolute top-2 right-2 bg-white/90 rounded p-1 opacity-0 group-hover:opacity-100"
              aria-label="Remove from Watch later"
            >
              <X className="w-4 h-4 text-red-600" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}