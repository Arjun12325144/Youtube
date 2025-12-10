import  { Suspense } from 'react'
import WatchLaterContent from  '@/components/WatchLaterContent'
export default function WatchLaterPage(){
    return  (
        <div className='flex-1 p-6'>
            <div className='max-w-4xl'>
                <h1 className='text-2xl font-bold mb-6'>Watch later videos</h1>
                <Suspense fallback = {<div>Loading watch later videos...</div>}>
                      <WatchLaterContent/>
                </Suspense>
            </div>
        </div>
    )
}