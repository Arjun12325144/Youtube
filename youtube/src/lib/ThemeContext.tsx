"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface UserLocation {
  city: string;
  state: string;
  country: string;
  isSouthIndia: boolean;
}

interface ThemeContextType {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;
  userLocation: UserLocation | null;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const SOUTH_INDIAN_STATES = [
  "tamil nadu",
  "kerala",
  "karnataka",
  "andhra pradesh",
  "telangana",
];

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<"light" | "dark">("light");
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const setTheme = (newTheme: "light" | "dark") => {
    setThemeState(newTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", newTheme);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  // Apply theme to DOM
  useEffect(() => {
    setMounted(true);
    
    // Check saved theme first
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setThemeState(savedTheme);
    }
  }, []);

  // Fetch location and determine default theme
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch("https://ipapi.co/json/", {
          signal: controller.signal,
        }).catch(() => null);
        
        clearTimeout(timeoutId);
        
        if (response && response.ok) {
          const data = await response.json();
          const location: UserLocation = {
            city: data.city || "Unknown",
            state: data.region || "Unknown",
            country: data.country_name || "Unknown",
            isSouthIndia: SOUTH_INDIAN_STATES.some(
              (state) =>
                data.region?.toLowerCase().includes(state) ||
                data.city?.toLowerCase().includes(state)
            ),
          };
          setUserLocation(location);

          // Only set default theme based on location if no saved preference
          const savedTheme = localStorage.getItem("theme");
          if (!savedTheme) {
            const currentHour = new Date().getHours();
            const isMorningTime = currentHour >= 10 && currentHour < 12;
            if (isMorningTime && location.isSouthIndia) {
              setThemeState("light");
            } else {
              setThemeState("dark");
            }
          }
        } else {
          // Fallback: use default theme based on time only
          const savedTheme = localStorage.getItem("theme");
          if (!savedTheme) {
            const currentHour = new Date().getHours();
            // Light theme during day (6am - 6pm), dark otherwise
            setThemeState(currentHour >= 6 && currentHour < 18 ? "light" : "dark");
          }
        }
      } catch (error) {
        // Silently handle location fetch errors
        console.warn("Location fetch failed, using default theme");
        const savedTheme = localStorage.getItem("theme");
        if (!savedTheme) {
          const currentHour = new Date().getHours();
          setThemeState(currentHour >= 6 && currentHour < 18 ? "light" : "dark");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocation();
  }, []);

  // Apply theme classes to document
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    const body = document.body;

    if (theme === "dark") {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
      body.style.backgroundColor = "#0f0f0f";
      body.style.color = "#f1f1f1";
    } else {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
      body.style.backgroundColor = "#ffffff";
      body.style.color = "#0f0f0f";
    }
  }, [theme, mounted]);

  // Prevent flash of wrong theme
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, userLocation, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export function getOTPMethod(state: string): "email" | "sms" {
  const isSouthIndia = SOUTH_INDIAN_STATES.some((s) =>
    state?.toLowerCase().includes(s)
  );
  return isSouthIndia ? "email" : "sms";
}
