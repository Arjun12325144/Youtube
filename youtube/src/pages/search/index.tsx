"use client";

import SearchResult from '@/components/SearchResult';
import { useRouter } from 'next/router';
import { Suspense, useState } from 'react';
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Loader2, Search as SearchIcon } from "lucide-react";

const SearchPage = () => {
  const router = useRouter();
  const { q } = router.query;
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
    >
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} />
        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-60" : "ml-16"} pt-14 p-6`}>
          {q && (
            <h1 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <SearchIcon className="w-5 h-5" style={{ color: "var(--primary)" }} />
              Search results for "{q}"
            </h1>
          )}
          <Suspense 
            fallback={
              <div className="flex items-center justify-center h-[40vh]">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--primary)" }} />
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