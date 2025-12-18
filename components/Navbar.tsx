"use client"
import Link from "next/link"
import LogoutButton from "./LogoutButton";
import { authClient } from "@/client/auth-client";


function Navbar() {
  //  const session = await getSession();
    const {data: session} = authClient.useSession();


  return (
    <div className='w-full border-b border-slate-700 shadow-large bg-[#1e293b]'>
      <div className='max-w-7xl mx-auto px-4'>
        <div className='flex items-center justify-between h-20'>
          {/* Logo */}
          <Link href='/' className='font-bold text-4xl text-blue-500'>
            Proctorly
          </Link>

          {/* Navigation Links */}
          <div className='hidden md:flex items-center space-x-4'>
            {session ? (
              <>
              
                <Link href='/' className='font-bold text-md text-white'>
                  Subjects
                </Link>

                <Link href='/dashboard' className='font-bold text-md text-white'>
                  Dashboard
                </Link>

                <LogoutButton/>
               
              </>
            ) : (
              <Link
                href='/login'
                className={`bg-blue-500 text-background p-2 rounded-lg font-semibold`}
              >
                Sign in with Google
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Navbar
