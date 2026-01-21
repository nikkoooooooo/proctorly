"use client"

import { useEffect, useState } from "react";
import { getSession } from "@/lib/auth-actions";
import { useRouter } from "next/navigation"

interface session {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string | null | undefined;
    userAgent?: string | null | undefined;
}

export default function Home() {
  const router = useRouter()
  const [session, setSession] = useState<session | null>(null)

  useEffect(() => {
    const checkSession = async () => {
      const sessionResult = await getSession()

      if (sessionResult) {
          setSession(sessionResult)
          router.replace("/dashboard")
      }
    }
    checkSession()
  },[router])

  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      <div className="max-w-7xl w-full">

          <div className="text-center mt-25 flex flex-col items-center gap-6 p-2">
             <h1 className="text-white font-bold text-6xl cursor-pointer">Welcome to Proctorly</h1>
              <div className="w-96 flex gap-4 justify-center">
                  <div className="bg-[#3b82f630]  font-semibold text-primary py-2 px-3 rounded-xl">
                      Secure
                  </div>
                  <span className="text-3xl text-gray-500">•</span>
                  <div className="bg-[#3b82f630]  font-semibold text-primary py-2 px-3 rounded-xl">
                      Efficient
                  </div>
                  <span className="text-3xl text-gray-500">•</span>
                  <div className="bg-[#3b82f630]  font-semibold text-primary py-2 px-3 rounded-xl">
                      Hassle-Free
                  </div>
              </div>
              <p className="text-4xl text-primary font-semibold">Take the stress out of online exams.</p>
              <p className="text-2xl text-gray-500">Proctorly ensures your quizzes and tests are protected with smart, non-invasive <br />
                 proctoring—so you can focus on learning, not cheating.</p>
          </div>



      </div>
    </div>
  );
}
