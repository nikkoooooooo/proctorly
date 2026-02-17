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

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.proctorlyx.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ProctorlyX",
    template: "%s | ProctorlyX",
  },
  description:
    "ProctorlyX is a simple and reliable platform for creating and managing online quizzes with non-invasive system.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ProctorlyX",
    description:
      "Create and manage online quizzes with a clean and non-invasive system.",
    url: siteUrl,
    siteName: "ProctorlyX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ProctorlyX",
    description:
      "Create and manage online quizzes with a clean and non-invasive system.",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Navbar />
        <main className="flex-1 w-full">
          {children}
        </main>
        {/* Footer with Terms and Privacy links */}
        <footer className="w-full border-t border-border bg-secondary/40">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-center px-4 py-6 text-sm text-muted-foreground">
            <span>© 2026 ProctorlyX. All rights reserved.</span>
            <span className="px-2">|</span>
            <a href="/terms" className="text-foreground hover:underline">
              Terms &amp; Conditions
            </a>
            <span className="px-2">|</span>
            <a href="/privacy" className="text-foreground hover:underline">
              Privacy Policy
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
