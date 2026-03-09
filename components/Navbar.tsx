"use client"
import Link from "next/link"
import LogoutButton from "./LogoutButton";
import ThemeToggle from "./ThemeToggle";
import { authClient } from "@/client/auth-client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getUserBySessionIdAction } from "@/lib/user/actions/getUserName";


function Navbar() {
  //  const session = await getSession();
    const {data: session} = authClient.useSession(
  
    );
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)
    const [isPaid, setIsPaid] = useState(false)
    const pathname = usePathname()
    // Disable navbar navigation only on the student quiz-taking view
    const navDisabled = !!pathname && /^\/quiz\/[^/]+$/.test(pathname)

    useEffect(() => {
      const loadBadge = async () => {
        const sessionId = session?.session?.id
        if (!sessionId) {
          setIsPaid(false)
          return
        }
        const result = await getUserBySessionIdAction(sessionId)
        const subscriptionData = result?.data?.subscription
        const isActive = subscriptionData?.status === "active"
        const planId = subscriptionData?.planId
        setIsPaid(Boolean(isActive && planId && planId !== "free"))
      }

      loadBadge()
    }, [session?.session?.id])


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
            <span className={`ml-0.5 font-medium ${isPaid ? "text-amber-500" : "text-primary"}`}>X</span>
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



            {/* Mobile: theme toggle + burger menu */}
            <div className='md:hidden flex items-center gap-3'>
              <ThemeToggle />
              <button
                type="button"
                onClick={() => setIsMenuOpen(prev => !prev)}
                className={`p-2 rounded-[var(--radius-button)] border border-border ${
                  navDisabled ? "pointer-events-none opacity-60" : ""
                }`}
                aria-label="Toggle menu"
                aria-expanded={isMenuOpen}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

        </div>


        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col gap-2 border-t border-border pt-4">
              {session ? (
                <>
                  <Link
                    href="/dashboard"
                    className={`font-semibold text-foreground ${
                      navDisabled ? "pointer-events-none opacity-60" : ""
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/profile"
                    className={`font-semibold text-foreground ${
                      navDisabled ? "pointer-events-none opacity-60" : ""
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/pricing"
                    className={`font-semibold text-foreground ${
                      navDisabled ? "pointer-events-none opacity-60" : ""
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Pricing
                  </Link>
                  <LogoutButton />
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="bg-primary text-primary-foreground p-2 rounded-[var(--radius-button)] font-semibold"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign in with Google
                  </Link>
                </>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default Navbar
