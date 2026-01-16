"use client"
import Link from "next/link"
import LogoutButton from "./LogoutButton";
import { authClient } from "@/client/auth-client";
import { useState } from "react";


function Navbar() {
  //  const session = await getSession();
    const {data: session} = authClient.useSession();
    const [isMenuOpen, SetIsMenuOpen] = useState<boolean>(false)



  return (
    <div className='w-full border-b border-slate-700 shadow-large bg-secondary'>
      <div className='max-w-7xl mx-auto px-4'>
        <div className='flex items-center justify-between h-20'>
          {/* Logo */}
          <Link 
            href='/dashboard' 
            className='font-bold text-4xl text-white'
            onCopy={(e) => e.preventDefault()}>
            Proctorly
          </Link>

          {/* Navigation Links */}
          <div className='hidden md:flex items-center '>
            {session ? (
              <div className="flex items-center justify-end w-96 gap-5">
                <Link href='/dashboard' className='font-bold text-md text-white'>
                  Dashboard
                </Link>

                <Link href='/dashboard' className='font-bold text-md text-white'>
                  Profile
                </Link>
                
                <LogoutButton/>
               
              </div>
            ) : (
              <Link
                href='/login'
                className={`bg-blue-500 text-background p-2 rounded-lg font-semibold`}
              >
                Sign in with Google
              </Link>
            )}
          </div>



            <div className='md:hidden flex items-center'>
            {/* Button aligned horizontally with logo */}
            <button 
              onClick={() => SetIsMenuOpen((prev) => !prev)}
              className='text-foreground hover:text-primary focus:outline-none focus:text-primary'
              aria-expanded={isMenuOpen} // Accessibility: indicates menu state
              aria-controls="mobile-menu"  // Accessibility: associates button with menu
            >
              {/* Hamburger icon */}
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

        </div>


        {isMenuOpen && (
            <div id="mobile-menu" className="md:hidden bg-secondary border-t border-slate-700">
              <div className="px-4 pt-4 pb-6 space-y-4">

                {session ? (
                  <div className="flex flex-col">
                    <Link
                      href="/dashboard"
                      className="block text-white font-medium text-lg"
                      onClick={() => SetIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>

                    <Link href='/dashboard' className='block font-medium text-lg text-white'>
                      Profile
                    </Link>

                    <LogoutButton/>

                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="block bg-blue-500 text-background px-4 py-2 rounded-lg font-semibold text-center"
                    onClick={() => SetIsMenuOpen(false)}
                  >
                    Sign in with Google
                  </Link>
                )}

              </div>
            </div>
          )}

      </div>
    </div>
  )
}

export default Navbar
