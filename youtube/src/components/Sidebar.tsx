// import Link from 'next/link';
// import React, {useState, useEffect} from 'react';
// import { Button } from './ui/button';
// import { Clock, Compass, History, Home, PlaySquare, ThumbsUp, User } from 'lucide-react';
// import Channeldialogue from '@/components/channeldialogue'
// import { useUser } from "@/lib/AuthContext";
// const Sidebar = ()=>{
//     // const user = {
//     //     id:"1",
//     //     name:"john doe",
//     //     email:"john@example.com",
//     //     image:"https://images.pexels.com/photos/33640952/pexels-photo-33640952.jpeg"
//     // }
//     const { user } = useUser();
//     // const [hasChannel,setHasChannel] = useState(false);
//     const [isClient, setIsClient] = useState(false);

//     useEffect(() => {
//         setIsClient(true);
//     }, []);
//     const [isdialogeopen,setIsdialogeopen] = useState(false)
//     return (
//         <aside className='w-64 bg-white min-h-screen p-2 border-r'>
//             <nav className=' space-y-1'>
//                 <Link href="/">
//                     <Button  variant="ghost"  className='w-full justify-start'>
//                         <Home className='w-5 h-5 mr-3'/>Home
//                     </Button>
//                 </Link>
//                 <Link href="/explore">
//                     <Button variant="ghost"   className='w-full justify-start'>
//                         <Compass className='w-5 h-5 mr-3'/>Explore
//                     </Button>
//                 </Link>
//                 <Link href="/subscriptions">
//                     <Button variant="ghost"   className='w-full justify-start'>
//                         <PlaySquare className='w-5 h-5 mr-3'/>subscriptions
//                     </Button>
//                 </Link>

//                 {isClient && user && (
//                     <>
//                         <div className='border-t pt-2 mt-2'>
//                             <Link href='/history'>
//                                 <Button variant = "ghost" className='w-full justify-start'>
//                                     <History className='w-5 h-5 mr-3'/>History
//                                 </Button>
//                             </Link>
//                             <Link href='/liked'>
//                                 <Button variant = "ghost" className='w-full justify-start'>
//                                     <ThumbsUp className='w-5 h-5 mr-3'/> Liked Videos
//                                 </Button>
//                             </Link>
//                             <Link href='/watch-later'>
//                                 <Button variant = "ghost" className='w-full justify-start'>
//                                     <Clock className='w-5 h-5 mr-3'/> Watch Later
//                                 </Button>
//                             </Link>
//                             {user?.channelname ? (
//                             <Link href={`/channel/${user.id}`}>
//                                 <Button variant = "ghost" className='w-full justify-start'>
//                                     <User className='w-5 h-5 mr-3'/> Your channel
//                                 </Button>
//                             </Link>
//                         ):(
//                             <div className='px-2 py-1.5'>
//                                 <Button variant='secondary' size='sm' className='w-full' onClick={()=>setIsdialogeopen(true)}>Create a channel</Button>
//                             </div>
//                         )}
                            
//                         </div>
//                     </>
//                 )}
                 
//             </nav>
//             <Channeldialogue isopen={isdialogeopen} onclose={()=>setIsdialogeopen(false)} mode="create" />
//         </aside>
//     )
// }
// export default Sidebar;
// import {
//   Home,
//   Compass,
//   PlaySquare,
//   Clock,
//   ThumbsUp,
//   History,
//   User,
// } from "lucide-react";
// import Link from "next/link";
// import React, { useState } from "react";
// import { Button } from "./ui/button";
// import Channeldialogue from "./channeldialogue";
// import { useUser } from "@/lib/AuthContext";

// const Sidebar = () => {
//   const { user } = useUser();

//   const [isdialogeopen, setisdialogeopen] = useState(false);
//   return (
//     <aside className="w-64 bg-white  border-r min-h-screen p-2">
//       <nav className="space-y-1">
//         <Link href="/">
//           <Button variant="ghost" className="w-full justify-start">
//             <Home className="w-5 h-5 mr-3" />
//             Home
//           </Button>
//         </Link>
//         <Link href="/explore">
//           <Button variant="ghost" className="w-full justify-start">
//             <Compass className="w-5 h-5 mr-3" />
//             Explore
//           </Button>
//         </Link>
//         <Link href="/subscriptions">
//           <Button variant="ghost" className="w-full justify-start">
//             <PlaySquare className="w-5 h-5 mr-3" />
//             Subscriptions
//           </Button>
//         </Link>

//         {user && (
//           <>
//             <div className="border-t pt-2 mt-2">
//               <Link href="/history">
//                 <Button variant="ghost" className="w-full justify-start">
//                   <History className="w-5 h-5 mr-3" />
//                   History
//                 </Button>
//               </Link>
//               <Link href="/liked">
//                 <Button variant="ghost" className="w-full justify-start">
//                   <ThumbsUp className="w-5 h-5 mr-3" />
//                   Liked videos
//                 </Button>
//               </Link>
//               <Link href="/watch-later">
//                 <Button variant="ghost" className="w-full justify-start">
//                   <Clock className="w-5 h-5 mr-3" />
//                   Watch later
//                 </Button>
//               </Link>
//               {user?.channelname ? (
//                 <Link href={`/channel/${user.id}`}>
//                   <Button variant="ghost" className="w-full justify-start">
//                     <User className="w-5 h-5 mr-3" />
//                     Your channel
//                   </Button>
//                 </Link>
//               ) : (
//                 <div className="px-2 py-1.5">
//                   <Button
//                     variant="secondary"
//                     size="sm"
//                     className="w-full"
//                     onClick={() => setisdialogeopen(true)}
//                   >
//                     Create Channel
//                   </Button>
//                 </div>
//               )}
//             </div>
//           </>
//         )}
//       </nav>
//       <Channeldialogue
//         isopen={isdialogeopen}
//         onclose={() => setisdialogeopen(false)}
//         mode="create"
//       />
//     </aside>
//   );
// };

// export default Sidebar;
import React, { useState, useEffect } from "react";
import { Home, Compass, PlaySquare, Clock, ThumbsUp, History, User } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import Channeldialogue from "./channeldialogue";
import { useUser } from "@/lib/AuthContext";

const Sidebar = () => {
  const { user } = useUser();
  const [isClient, setIsClient] = useState(false);
  const [isdialogeopen, setisdialogeopen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <aside className="w-64 bg-white border-r min-h-screen p-2">
      <nav className="space-y-1">
        <Link href="/">
          <Button variant="ghost" className="w-full justify-start">
            <Home className="w-5 h-5 mr-3" />
            Home
          </Button>
        </Link>
        <Link href="/explore">
          <Button variant="ghost" className="w-full justify-start">
            <Compass className="w-5 h-5 mr-3" />
            Explore
          </Button>
        </Link>
        <Link href="/subscriptions">
          <Button variant="ghost" className="w-full justify-start">
            <PlaySquare className="w-5 h-5 mr-3" />
            Subscriptions
          </Button>
        </Link>

        {isClient && user && (
          <div className="border-t pt-2 mt-2">
            <Link href="/history">
              <Button variant="ghost" className="w-full justify-start">
                <History className="w-5 h-5 mr-3" />
                History
              </Button>
            </Link>
            <Link href="/liked">
              <Button variant="ghost" className="w-full justify-start">
                <ThumbsUp className="w-5 h-5 mr-3" />
                Liked videos
              </Button>
            </Link>
            <Link href="/watch-later">
              <Button variant="ghost" className="w-full justify-start">
                <Clock className="w-5 h-5 mr-3" />
                Watch later
              </Button>
            </Link>
            {user?.channelname ? (
              <Link href={`/channel/${user._id}`}>
                <Button variant="ghost" className="w-full justify-start">
                  <User className="w-5 h-5 mr-3" />
                  Your channel
                </Button>
              </Link>
            ) : (
              <div className="px-2 py-1.5">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={() => setisdialogeopen(true)}
                >
                  Create Channel
                </Button>
              </div>
            )}
          </div>
        )}
      </nav>
      <Channeldialogue
        isopen={isdialogeopen}
        onclose={() => setisdialogeopen(false)}
        mode="create"
      />
    </aside>
  );
};

export default Sidebar;
