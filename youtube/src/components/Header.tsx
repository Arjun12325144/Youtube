"use client";

import { useEffect, useState } from "react";
import { Bell, Menu, Mic, Search, Sun, Moon, Upload, LogOut, User, Video } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useUser } from "@/lib/AuthContext";
import { useTheme } from "@/lib/ThemeContext";
import Channeldialogue from "./channeldialogue";

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, logout, handkegooglesignin } = useUser();
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 bg-[var(--color-background)] border-b border-[var(--color-border)]">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-full hover:bg-[var(--color-secondary)] transition-colors"
          >
            <Menu className="w-6 h-6 text-[var(--color-foreground)]" />
          </button>
          
          <Link href="/" className="flex items-center gap-1">
            <div className="flex items-center justify-center w-8 h-8 bg-red-600 rounded-lg">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </div>
            <span className="text-xl font-semibold text-[var(--color-foreground)] hidden sm:block">
              YouTube
            </span>
          </Link>
        </div>

        {/* Center Section - Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-4 hidden sm:flex">
          <div className="flex w-full">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 h-10 px-4 rounded-l-full border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="h-10 px-6 rounded-r-full bg-[var(--color-secondary)] border border-l-0 border-[var(--color-border)] hover:bg-[var(--color-accent)] transition-colors"
            >
              <Search className="w-5 h-5 text-[var(--color-foreground)]" />
            </button>
          </div>
          <button
            type="button"
            className="ml-3 p-2.5 rounded-full bg-[var(--color-secondary)] hover:bg-[var(--color-accent)] transition-colors"
          >
            <Mic className="w-5 h-5 text-[var(--color-foreground)]" />
          </button>
        </form>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-[var(--color-secondary)] transition-colors"
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-[var(--color-foreground)]" />
            )}
          </button>

          {isClient && user ? (
            <>
              {/* Upload Button */}
              <Link
                href={user?.channelname ? `/channel/${user._id}` : "#"}
                onClick={(e) => {
                  if (!user?.channelname) {
                    e.preventDefault();
                    setIsDialogOpen(true);
                  }
                }}
              >
                <button className="p-2 rounded-full hover:bg-[var(--color-secondary)] transition-colors">
                  <Upload className="w-5 h-5 text-[var(--color-foreground)]" />
                </button>
              </Link>

              {/* Notifications */}
              <button className="p-2 rounded-full hover:bg-[var(--color-secondary)] transition-colors">
                <Bell className="w-5 h-5 text-[var(--color-foreground)]" />
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-medium text-sm overflow-hidden"
                >
                  {user.image ? (
                    <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name?.[0]?.toUpperCase() || "U"
                  )}
                </button>

                {showDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowDropdown(false)}
                    />
                    <div className="absolute right-0 top-12 w-72 bg-[var(--color-popover)] border border-[var(--color-border)] rounded-xl shadow-xl z-50 overflow-hidden">
                      <div className="flex items-center gap-3 p-4 border-b border-[var(--color-border)]">
                        <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-medium">
                          {user.image ? (
                            <img src={user.image} alt={user.name} className="w-full h-full object-cover rounded-full" />
                          ) : (
                            user.name?.[0]?.toUpperCase() || "U"
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-[var(--color-foreground)]">{user.name}</p>
                          <p className="text-sm text-[var(--color-muted-foreground)]">{user.email}</p>
                        </div>
                      </div>
                      
                      <div className="py-2">
                        {user?.channelname ? (
                          <Link
                            href={`/channel/${user._id}`}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--color-secondary)] transition-colors"
                            onClick={() => setShowDropdown(false)}
                          >
                            <Video className="w-5 h-5 text-[var(--color-foreground)]" />
                            <span className="text-[var(--color-foreground)]">Your channel</span>
                          </Link>
                        ) : (
                          <button
                            onClick={() => {
                              setIsDialogOpen(true);
                              setShowDropdown(false);
                            }}
                            className="flex items-center gap-3 px-4 py-2.5 w-full hover:bg-[var(--color-secondary)] transition-colors"
                          >
                            <Video className="w-5 h-5 text-[var(--color-foreground)]" />
                            <span className="text-[var(--color-foreground)]">Create channel</span>
                          </button>
                        )}
                        
                        <button
                          onClick={() => {
                            logout();
                            setShowDropdown(false);
                          }}
                          className="flex items-center gap-3 px-4 py-2.5 w-full hover:bg-[var(--color-secondary)] transition-colors"
                        >
                          <LogOut className="w-5 h-5 text-[var(--color-foreground)]" />
                          <span className="text-[var(--color-foreground)]">Sign out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={handkegooglesignin}
              className="flex items-center gap-2 px-3 py-1.5 border border-blue-500 text-blue-500 rounded-full hover:bg-blue-500/10 transition-colors"
            >
              <User className="w-5 h-5" />
              <span className="font-medium">Sign in</span>
            </button>
          )}
        </div>
      </header>

      <Channeldialogue open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </>
  );
}
