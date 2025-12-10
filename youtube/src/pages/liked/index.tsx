import { Suspense } from "react";
import LikedContent from "@/components/LikedContent"
const index = ()=>{
    return(
        <div className='flex-1 p-6'>
            <div className='max-w-4xl'>
                <h1 className='text-2xl font-bold mb-6'>Liked videos</h1>
                <Suspense fallback = {<div>Loading liked videos...</div>}>
                    <LikedContent/>
                </Suspense>
            </div>
        </div>
    )
}
export default index;