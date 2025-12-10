import SearchResult from '@/components/SearchResult';
import {useRouter} from 'next/router';
import { Suspense } from 'react';

const Search = ()=>{
    const router = useRouter();
    const {q}  = router.query;
    return(
        <div>
            <div>
                {q && (
                    <div>
                        <h1>Search results for "{q}"</h1>
                    </div>

                )}
                <Suspense fallback={<div>loading...</div>}>
                    <SearchResult query={q || ""} />
                </Suspense>
            </div>
        </div>
    )
}
export default Search;