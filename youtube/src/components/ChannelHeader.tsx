// import {useState} from 'react'
// import { Avatar, AvatarFallback } from './ui/avatar';
// import { Button } from './ui/button';
// const ChannelHeader = ({channel,user}:any)=>{
//     const [isSubscribed,setIsSubscribed] = useState(false);
//     return (
//         <div className='w-full'>
//             <div className='relative h-32 md:h-40 lg:h-64 bg-gradient-to-r from to-blue-400 to bg-purple-500 overflow-hidden'></div>
//             <div className='px-4 py-6'>
//                 <div className='flex flex-col md:flex-row gap-6 items-start'>
//                     <Avatar className='w-20 h-20 md:w-32 md:h-32'>
//                         <AvatarFallback className='text-2xl'>
//                             {channel?.channelname }
//                         </AvatarFallback>
//                     </Avatar>
//                     <div className='flex-1 space-y-2'>
//                         <h1 className='text-2xl md:text-4xl font-bold'> {channel.channelname} </h1>
//                         <div className='flex flex-wrap gap-4 text-sm text-gray-600'>
//                             <span> @{channel?.channelname?.toLowerCase().replace(/\s+/g,"")} </span>
//                         </div>
//                         {channel.description && (
//                             <p className='text-sm text-gray-700 max-w-2xl'> {channel.description} </p>
//                         )}
//                     </div>
//                     {user && user._id === channel._id && (
//                         <div className='flex gap-2'>
//                             <Button onClick={()=>setIsSubscribed(!isSubscribed)} className={isSubscribed?"bg-gray-100": "bg-red-600 hover:bg-red-700"} variant={isSubscribed?"outline":"default"}>
//                                 {isSubscribed?"Unsubscribe":"Subscribe"}
//                             </Button>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     )
// }
// export default ChannelHeader 

import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import axiosInstance from "@/lib/axiosinstance";
import { getSocket } from "@/lib/socket";

const ChannelHeader = ({ channel, user }: any) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // load subscription status and count
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!channel?._id) return;
      try {
        if (user && user._id) {
          const check = await axiosInstance.get(`/subscribe/check/${channel._id}/${user._id}`);
          if (mounted) setIsSubscribed(!!check.data.subscribed);
        }
        const cnt = await axiosInstance.get(`/subscribe/count/${channel._id}`);
        if (mounted) setSubscriberCount(cnt.data.count || 0);
      } catch (err) {
        console.error("Failed to load subscription info:", err);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [channel?._id, user]);

  // realtime updates to subscriber counts
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handler = (data: any) => {
      if (!data || data.channelId !== channel?._id) return;
      setSubscriberCount((prev) => {
        const delta = data.subscribed ? 1 : -1;
        const base = typeof prev === "number" ? prev : 0;
        return Math.max(0, base + delta);
      });
      // if the update concerns current user subscription status, update local flag
      if (user && data.subscriber === user._id) {
        setIsSubscribed(!!data.subscribed);
      }
    };
    socket.on("subscriptionToggled", handler);
    return () => {
      socket.off("subscriptionToggled", handler);
    };
  }, [channel?._id, user]);

  return (
    <div className="w-full">
      {/* Banner */}
      <div className="relative h-32 md:h-48 lg:h-64 bg-gradient-to-r from-blue-400 to-purple-500 overflow-hidden"></div>

      {/* Channel Info */}
      <div className="px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <Avatar className="w-20 h-20 md:w-32 md:h-32">
            <AvatarFallback className="text-2xl font-bold">
              {isClient ? channel?.channelname?.[0] : null}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <h1 className="text-2xl md:text-4xl font-bold">{channel?.channelname}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <span>@{channel?.channelname?.toLowerCase().replace(/\s+/g, "")}</span>
            </div>
            {channel?.description && (
              <p className="text-sm text-gray-700 max-w-2xl">
                {channel?.description}
              </p>
            )}
          </div>

          {user && user?._id !== channel?._id && (
            <div className="flex gap-2">
              <Button
                onClick={async () => {
                  try {
                    // call toggle API
                    const res = await axiosInstance.post(`/subscribe/${channel._id}`, {
                      subscriber: user._id,
                    });
                    if (res.data && typeof res.data.subscribed !== "undefined") {
                      setIsSubscribed(!!res.data.subscribed);
                    }
                  } catch (err) {
                    console.error("Failed to toggle subscription:", err);
                  }
                }}
                variant={isSubscribed ? "outline" : "default"}
                className={
                  isSubscribed ? "bg-gray-100" : "bg-red-600 hover:bg-red-700"
                }
              >
                {isSubscribed ? "Subscribed" : "Subscribe"}
              </Button>
              {subscriberCount !== null && (
                <div className="text-sm text-gray-600 self-center">
                  {subscriberCount.toLocaleString()} subscribers
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChannelHeader;