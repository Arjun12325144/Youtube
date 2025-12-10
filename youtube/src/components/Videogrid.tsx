// import React from 'react';
// import Videocard from './Videocard'
// const Videogrid = ()=>{
//     const videos = [
//         {
//             _id:"1",
//             videotitle:"Amazing Nature Documentry",
//             filename:'vdo.mp4',
//             filetype:'video/mp4',
//             filepath:"/video/vdo.mp4",
//             filesize: "500MB",
//             videochannel : "Nature channel",
//             Like:1250,
//             views:45000,
//             uploader:"nature_lover",
//             createdAt:new Date().toISOString(),
    
//         },
//         {
//             _id:"2",
//             videotitle:"Amazing Nature Documentry",
//             filename:'vdo.mp4',
//             filetype:'video/mp4',
//             filepath:"/video/vdo.mp4",
//             filesize: "500MB",
//             videochannel : "Nature channel",
//             Like:1250,
//             views:45000,
//             uploader:"nature_lover",
//             createdAt:new Date().toISOString(),
    
//         },
    
    
//     ]
//     // console.log(videos.filepath);sssss
//     return (
        
//         <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
            
//             {videos.map((video: any)=>
                 
//                 <Videocard key={video._id} video={video}/>
//             )}
//         </div>
//     )
// }
// export default Videogrid
import React, { useEffect, useState } from "react";
import Videocard from "./Videocard";
import axiosInstance from "@/lib/axiosinstance";

const Videogrid = ({ filterCategory }: { filterCategory?: string }) => {
  const [videos, setvideo] = useState<any[]>([]);
  const [loading, setloading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchvideo = async () => {
      try {
        setError(null);
        const res = await axiosInstance.get("/video/getall");
        // Ensure that we always have an array
        let list = res.data || [];
        if (filterCategory && filterCategory !== "All") {
          // No explicit category on the video model; attempt a simple filter by title or channel name
          const cat = filterCategory.toLowerCase();
          list = list.filter((v: any) => {
            return (
              (v.videotitle && v.videotitle.toLowerCase().includes(cat)) ||
              (v.videochanel && v.videochanel.toLowerCase().includes(cat))
            );
          });
        }
        setvideo(list);
      } catch (error) {
        console.log(error);
        setError("Failed to load videos. Please try again later.");
      } finally {
        setloading(false);
      }
    };
    fetchvideo();
  }, []);

  // const videos = [
  //   {
  //     _id: "1",
  //     videotitle: "Amazing Nature Documentary",
  //     filename: "nature-doc.mp4",
  //     filetype: "video/mp4",
  //     filepath: "/videos/nature-doc.mp4",
  //     filesize: "500MB",
  //     videochanel: "Nature Channel",
  //     Like: 1250,
  //     views: 45000,
  //     uploader: "nature_lover",
  //     createdAt: new Date().toISOString(),
  //   },
  //   {
  //     _id: "2",
  //     videotitle: "Cooking Tutorial: Perfect Pasta",
  //     filename: "pasta-tutorial.mp4",
  //     filetype: "video/mp4",
  //     filepath: "/videos/pasta-tutorial.mp4",
  //     filesize: "300MB",
  //     videochanel: "Chef's Kitchen",
  //     Like: 890,
  //     views: 23000,
  //     uploader: "chef_master",
  //     createdAt: new Date(Date.now() - 86400000).toISOString(),
  //   },
  // ];
  if (loading) {
    return <div className="p-4 text-center">Loading videos...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {videos.length > 0 ? (
        videos.map((video: any) => <Videocard key={video._id} video={video} />)
      ) : (
        <p className="col-span-full text-center">No videos found.</p>
      )}
    </div>
  );
};

export default Videogrid;