"use client"
import Link from "next/link"
import LogoutButton from "./LogoutButton";
import ThemeToggle from "./ThemeToggle";
import { authClient } from "@/client/auth-client";
import { useState } from "react";
import { usePathname } from "next/navigation";


function Navbar() {
  //  const session = await getSession();
    const {data: session} = authClient.useSession(
  
    );
    const [isMenuOpen, SetIsMenuOpen] = useState<boolean>(false)
    const pathname = usePathname()
    // Disable navbar navigation only on the student quiz-taking view
    const navDisabled = !!pathname && /^\/quiz\/[^/]+$/.test(pathname)



  return (
    <div className='w-full border-b border-border shadow-large bg-secondary'>
      <div className='max-w-7xl mx-auto px-4'>
        <div className='flex items-center justify-between h-20'>
          {/* Logo */}
          <Link
            href='/dashboard'
            className={`text-4xl text-foreground ${navDisabled ? "pointer-events-none opacity-60" : ""}`}
            onCopy={(e) => e.preventDefault()}
          >
            {/* Text-only wordmark with a quiet emphasis on the "X" */}
            <span className="font-semibold tracking-tight">Proctorly</span>
            <span className="ml-0.5 font-medium text-primary">X</span>
          </Link>

          {/* Navigation Links */}
          <div className='hidden md:flex items-center '>
            {session ? (
              <div className="flex items-center justify-end w-96 gap-5">
                <Link
                  href='/dashboard'
                  className={`font-bold text-md text-foreground hover:bg-primary/20 active:bg-primary/30 ${
                    navDisabled ? "pointer-events-none opacity-60" : ""
                  }`}
                >
                  Dashboard
                </Link>

                <Link
                  href='/profile'
                  className={`font-bold text-md text-foreground hover:bg-primary/20 active:bg-primary/30 ${
                    navDisabled ? "pointer-events-none opacity-60" : ""
                  }`}
                >
                  Profile
                </Link>

                <Link
                  href='/pricing'
                  className={`font-bold text-md text-foreground hover:bg-primary/20 active:bg-primary/30 ${
                    navDisabled ? "pointer-events-none opacity-60" : ""
                  }`}
                >
                  Pricing
                </Link>
                
                <ThemeToggle />
                <LogoutButton/>
               
              </div>
            ) : (
              <div className="flex items-center gap-5">
                {/* Keep theme toggle visible even without a session */}
                <ThemeToggle />
                <Link
                  href='/login'
                  className={`bg-primary text-primary-foreground p-2 rounded-[var(--radius-button)] font-semibold`}
                >
                  Sign in with Google
                </Link>
              </div>
            )}
          </div>



            {/* Mobile: keep only the theme toggle (no burger menu) */}
            <div className='md:hidden flex items-center gap-3'>
              <ThemeToggle />
            </div>

        </div>


        {/* Mobile menu removed per request */}

      </div>
    </div>
  )
}

export default Navbar
