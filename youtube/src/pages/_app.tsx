import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Toaster } from "sonner";
import { UserProvider } from "../lib/AuthContext";
import { ThemeProvider } from "../lib/ThemeContext";
import MobileNav from "@/components/MobileNav";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <ThemeProvider>
        <Component {...pageProps} />
        <MobileNav />
        <Toaster position="bottom-right" />
      </ThemeProvider>
    </UserProvider>
  );
}
