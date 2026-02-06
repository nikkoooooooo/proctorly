import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getSession } from "@/lib/auth-actions";
import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";



const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "ProctorlyX",
  description:
    "ProctorlyX is a simple and reliable platform for creating and managing online quizzes.",

  openGraph: {
    title: "ProctorlyX",
    description:
      "Create and manage online quizzes with a clean and non-invasive system.",
    type: "website",
  },
};


export const dynamic = "force-dynamic";


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <html lang="en" className="theme-dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar/>
        {children}
        {/* Footer with Terms & Privacy link */}
        <footer className="w-full border-t border-border bg-secondary/40">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-center px-4 py-6 text-sm text-muted-foreground">
            <span>© 2026 ProctorlyX. All rights reserved.</span>
            <span className="px-2">|</span>
            <a href="/terms-privacy" className="text-foreground hover:underline">
              Terms &amp; Privacy
            </a>
          </div>
        </footer>
        <Toaster
          position="top-center" // toast container at top center
          toastOptions={{
            className: "w-full max-w-full rounded-none", // full width
            style: {
              width: "100%",          // full width of container
              maxWidth: "100%",       // prevent shrinking
              margin: 0,              // remove default margin
              borderRadius: "0px",    // remove rounding
            },
          }}
        />
      </body>
    </html>
  );
}
