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
} from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  isOpen: boolean;
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

export default function Sidebar({ isOpen }: SidebarProps) {
  const router = useRouter();
  const [showMore, setShowMore] = useState(false);

  const NavItem = ({ item, compact = false }: { item: typeof mainMenu[0]; compact?: boolean }) => {
    const Icon = item.icon;
    const isActive = router.pathname === item.href || router.asPath === item.href;

    return (
      <Link
        href={item.href}
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
        <Icon className={`${compact ? "w-5 h-5" : "w-5 h-5"} text-[var(--color-foreground)]`} />
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

  // Compact sidebar (icons only)
  if (!isOpen) {
    return (
      <aside className="fixed left-0 top-14 w-[72px] h-[calc(100vh-56px)] bg-[var(--color-background)] z-40 overflow-y-auto scrollbar-hide">
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

  // Full sidebar
  return (
    <aside className="fixed left-0 top-14 w-60 h-[calc(100vh-56px)] bg-[var(--color-background)] border-r border-[var(--color-border)] z-40 overflow-y-auto scrollbar-hide">
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
