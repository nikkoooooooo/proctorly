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
  title: "Proctorly",
  description:
    "Proctorly is a simple and reliable platform for creating and managing online quizzes.",

  openGraph: {
    title: "Proctorly",
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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar/>
        {children}
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
