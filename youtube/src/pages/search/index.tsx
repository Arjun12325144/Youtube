"use client";

import SearchResult from '@/components/SearchResult';
import { useRouter } from 'next/router';
import { Suspense, useState, useEffect } from 'react';
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Loader2, Search as SearchIcon } from "lucide-react";

const SearchPage = () => {
  const router = useRouter();
  const { q } = router.query;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const mainClass = isMobile ? "ml-0" : sidebarOpen ? "ml-60" : "ml-[72px]";

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isMobile={isMobile} />
        <main className={`flex-1 transition-all duration-300 pb-16 lg:pb-0 ${mainClass} pt-14 p-3 sm:p-4 lg:p-6`}>
          {q && (
            <h1 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 flex items-center gap-2 text-[var(--color-foreground)]">
              <SearchIcon className="w-5 h-5 text-[var(--color-primary)]" />
              <span className="line-clamp-1">Search results for "{q}"</span>
            </h1>
          )}
          <Suspense 
            fallback={
              <div className="flex items-center justify-center h-[40vh]">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
              </div>
            }
          >
            <SearchResult query={q || ""} />
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default SearchPage;