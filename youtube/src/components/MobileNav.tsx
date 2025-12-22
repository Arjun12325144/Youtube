"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { Home, Compass, PlaySquare, Clock, User } from "lucide-react";
import { useUser } from "@/lib/AuthContext";

const navItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Compass, label: "Explore", href: "/explore" },
  { icon: PlaySquare, label: "Subs", href: "/subscriptions" },
  { icon: Clock, label: "Library", href: "/history" },
];

export default function MobileNav() {
  const router = useRouter();
  const { user } = useUser();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-background)] border-t border-[var(--color-border)] lg:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = router.pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors ${
                isActive 
                  ? "text-[var(--color-primary)]" 
                  : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </Link>
          );
        })}
        
        {/* Profile/Sign in */}
        <Link
          href={user ? `/channel/${user._id}` : "#"}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]`}
        >
          {user?.image ? (
            <img src={user.image} alt="" className="w-5 h-5 rounded-full object-cover" />
          ) : (
            <User className="w-5 h-5" />
          )}
          <span className="text-[10px] mt-0.5">{user ? "You" : "Sign in"}</span>
        </Link>
      </div>
    </nav>
  );
}
