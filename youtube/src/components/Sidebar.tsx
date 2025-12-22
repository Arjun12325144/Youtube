"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import {
  Home,
  Compass,
  PlaySquare,
  Clock,
  ThumbsUp,
  History,
  Download,
  Crown,
  ChevronDown,
  ChevronUp,
  Flame,
  Music2,
  Gamepad2,
  Film,
  Radio,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
  isMobile?: boolean;
}

const mainMenu = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Compass, label: "Explore", href: "/explore" },
  { icon: PlaySquare, label: "Subscriptions", href: "/subscriptions" },
];

const libraryMenu = [
  { icon: History, label: "History", href: "/history" },
  { icon: Clock, label: "Watch Later", href: "/watch-later" },
  { icon: ThumbsUp, label: "Liked Videos", href: "/liked" },
  { icon: Download, label: "Downloads", href: "/downloads" },
];

const exploreMenu = [
  { icon: Flame, label: "Trending", href: "/explore?tab=trending" },
  { icon: Music2, label: "Music", href: "/explore?tab=music" },
  { icon: Gamepad2, label: "Gaming", href: "/explore?tab=gaming" },
  { icon: Film, label: "Movies", href: "/explore?tab=movies" },
  { icon: Radio, label: "Live", href: "/explore?tab=live" },
];

export default function Sidebar({ isOpen, onClose, isMobile: isMobileProp }: SidebarProps) {
  const router = useRouter();
  const [showMore, setShowMore] = useState(false);
  const [isMobileInternal, setIsMobileInternal] = useState(false);

  // Use prop if provided, otherwise use internal state
  const isMobile = isMobileProp !== undefined ? isMobileProp : isMobileInternal;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobileInternal(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close sidebar on route change for mobile
  useEffect(() => {
    if (isMobile && onClose) {
      router.events.on("routeChangeComplete", onClose);
      return () => router.events.off("routeChangeComplete", onClose);
    }
  }, [isMobile, onClose, router.events]);

  const NavItem = ({ item, compact = false }: { item: typeof mainMenu[0]; compact?: boolean }) => {
    const Icon = item.icon;
    const isActive = router.pathname === item.href || router.asPath === item.href;

    return (
      <Link
        href={item.href}
        onClick={() => isMobile && onClose?.()}
        className={`flex items-center rounded-xl transition-colors ${
          compact
            ? "flex-col gap-1 py-4 px-1"
            : "gap-6 px-3 py-2.5 mx-3"
        } ${
          isActive
            ? "bg-[var(--color-secondary)] font-medium"
            : "hover:bg-[var(--color-secondary)]"
        }`}
      >
        <Icon className="w-5 h-5 text-[var(--color-foreground)]" />
        <span
          className={`${
            compact ? "text-[10px]" : "text-sm"
          } text-[var(--color-foreground)] whitespace-nowrap`}
        >
          {item.label}
        </span>
      </Link>
    );
  };

  // Mobile: Drawer with overlay
  if (isMobile) {
    return (
      <>
        {/* Overlay */}
        <div
          className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={onClose}
        />
        
        {/* Mobile Drawer */}
        <aside
          className={`fixed left-0 top-0 w-64 h-full bg-[var(--color-background)] z-50 transform transition-transform duration-300 ease-in-out ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Header */}
          <div className="h-14 flex items-center justify-between px-4 border-b border-[var(--color-border)]">
            <Link href="/" className="flex items-center gap-1" onClick={onClose}>
              <div className="flex items-center justify-center w-8 h-8 bg-red-600 rounded-lg">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </div>
              <span className="text-xl font-semibold text-[var(--color-foreground)]">YouTube</span>
            </Link>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-[var(--color-secondary)]">
              <X className="w-5 h-5 text-[var(--color-foreground)]" />
            </button>
          </div>

          {/* Content */}
          <div className="h-[calc(100%-56px)] overflow-y-auto scrollbar-hide py-3">
            <div className="pb-3 border-b border-[var(--color-border)]">
              {mainMenu.map((item) => <NavItem key={item.href} item={item} />)}
            </div>
            <div className="py-3 border-b border-[var(--color-border)]">
              <h3 className="px-6 mb-1 text-sm font-medium text-[var(--color-foreground)]">Library</h3>
              {libraryMenu.map((item) => <NavItem key={item.href} item={item} />)}
            </div>
            {showMore && (
              <div className="py-3 border-b border-[var(--color-border)]">
                <h3 className="px-6 mb-1 text-sm font-medium text-[var(--color-foreground)]">Explore</h3>
                {exploreMenu.map((item) => <NavItem key={item.href} item={item} />)}
              </div>
            )}
            <button
              onClick={() => setShowMore(!showMore)}
              className="flex items-center gap-6 px-3 py-2.5 mx-3 rounded-xl w-[calc(100%-24px)] hover:bg-[var(--color-secondary)]"
            >
              {showMore ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              <span className="text-sm text-[var(--color-foreground)]">{showMore ? "Show less" : "Show more"}</span>
            </button>
            <div className="py-3">
              <Link href="/premium" onClick={onClose} className={`flex items-center gap-6 px-3 py-2.5 mx-3 rounded-xl ${router.pathname === "/premium" ? "bg-[var(--color-secondary)]" : "hover:bg-[var(--color-secondary)]"}`}>
                <Crown className="w-5 h-5 text-yellow-500" />
                <span className="text-sm text-[var(--color-foreground)]">Premium</span>
              </Link>
            </div>
          </div>
        </aside>
      </>
    );
  }

  // Desktop: Compact sidebar (icons only)
  if (!isOpen) {
    return (
      <aside className="fixed left-0 top-14 w-[72px] h-[calc(100vh-56px)] bg-[var(--color-background)] z-40 overflow-y-auto scrollbar-hide hidden lg:block">
        <div className="py-1">
          {mainMenu.map((item) => (
            <NavItem key={item.href} item={item} compact />
          ))}
          <NavItem item={{ icon: Download, label: "Downloads", href: "/downloads" }} compact />
          <NavItem item={{ icon: Crown, label: "Premium", href: "/premium" }} compact />
        </div>
      </aside>
    );
  }

  // Desktop: Full sidebar
  return (
    <aside className="fixed left-0 top-14 w-60 h-[calc(100vh-56px)] bg-[var(--color-background)] border-r border-[var(--color-border)] z-40 overflow-y-auto scrollbar-hide hidden lg:block">
      <div className="py-3">
        {/* Main Menu */}
        <div className="pb-3 border-b border-[var(--color-border)]">
          {mainMenu.map((item) => (
            <NavItem key={item.href} item={item} />
          ))}
        </div>

        {/* Library */}
        <div className="py-3 border-b border-[var(--color-border)]">
          <h3 className="px-6 mb-1 text-sm font-medium text-[var(--color-foreground)]">Library</h3>
          {libraryMenu.map((item) => (
            <NavItem key={item.href} item={item} />
          ))}
        </div>

        {/* Explore */}
        {showMore && (
          <div className="py-3 border-b border-[var(--color-border)]">
            <h3 className="px-6 mb-1 text-sm font-medium text-[var(--color-foreground)]">Explore</h3>
            {exploreMenu.map((item) => (
              <NavItem key={item.href} item={item} />
            ))}
          </div>
        )}

        {/* Show More/Less */}
        <button
          onClick={() => setShowMore(!showMore)}
          className="flex items-center gap-6 px-3 py-2.5 mx-3 rounded-xl w-[calc(100%-24px)] hover:bg-[var(--color-secondary)] transition-colors"
        >
          {showMore ? (
            <ChevronUp className="w-5 h-5 text-[var(--color-foreground)]" />
          ) : (
            <ChevronDown className="w-5 h-5 text-[var(--color-foreground)]" />
          )}
          <span className="text-sm text-[var(--color-foreground)]">
            {showMore ? "Show less" : "Show more"}
          </span>
        </button>

        {/* Premium */}
        <div className="py-3">
          <Link
            href="/premium"
            className={`flex items-center gap-6 px-3 py-2.5 mx-3 rounded-xl transition-colors ${
              router.pathname === "/premium"
                ? "bg-[var(--color-secondary)] font-medium"
                : "hover:bg-[var(--color-secondary)]"
            }`}
          >
            <Crown className="w-5 h-5 text-yellow-500" />
            <span className="text-sm text-[var(--color-foreground)]">Premium</span>
          </Link>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 text-xs text-[var(--color-muted-foreground)]">
          <p className="mb-3">© 2024 YouTube Clone</p>
          <p className="leading-relaxed">
            About Press Copyright Contact us Creators Advertise Developers
          </p>
        </div>
      </div>
    </aside>
  );
}
