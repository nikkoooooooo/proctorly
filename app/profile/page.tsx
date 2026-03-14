// import React from 'react'

// function profile() {
//   return (
//     <div className='min-h-screen flex items-center justify-center'>Currently Developing...</div>
//   )
// }

// export default profile

"use client"

import { useEffect, useState } from "react"
import { getUserBySessionIdAction } from "@/lib/user/actions/getUserName"
import { updateUser } from "@/lib/user/actions/updateUser"
import { authClient } from "@/client/auth-client"
import toast from "react-hot-toast"

function Profile() {
    const [name, setName] = useState("username")
    const [email, setEmail] = useState("username@gmail.com")
    const [studentNo, setStudentNo] = useState("")
    const [section, setSection] = useState("")
    const [image, setImage] = useState<string | null>(null)

    const { data } = authClient.useSession()

    const sessionId = data?.session?.id ?? null



   useEffect(() => {
    if (!sessionId) return
    const fetchName = async () => {
      try {
        const data = await getUserBySessionIdAction(sessionId)
        if (data.data?.user.name && data.data?.user.email) {
          setName(data.data.user.name)
          setEmail(data.data.user.email)
        }
        if (data.data?.user.studentNo) setStudentNo(data.data.user.studentNo)
        if (data.data?.user.section) setSection(data.data.user.section)
        if (data.data?.user.image) setImage(data.data.user.image)
      } catch (error) {
        console.error(error)
      }
    }
    fetchName()
   },[sessionId])


   const handleChangeProfile = async () => {
    try {
      if (!data?.session.userId) return
      await updateUser({
        userId: data.session.userId,
        name,
        studentNo,
        section,
      })
      toast.success("Profile updated successfully!")
    } catch (error) {
      console.error(error)
      toast.error("Could not update profile. Try again.")

    }
      
   }

  return (
    <div className='min-h-screen flex justify-center'>
        <div className='max-w-2xl w-full flex flex-col items-center m-4'>
            <div className='mt-5 flex flex-col w-full gap-4 border border-border p-4 rounded-[var(--radius-card)]'>
              {!studentNo && !section && (
                <div className="rounded-[var(--radius-card)] border border-border bg-muted/40 p-3 text-sm text-foreground">
                  Complete your profile by adding your Student No and Section.
                </div>
              )}
              <div className="flex items-center gap-4">
                {image ? (
                  <img
                    src={image}
                    alt={name}
                    className="h-14 w-14 rounded-full object-cover border border-border"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center text-lg font-semibold text-muted-foreground">
                    {name?.[0] ?? "U"}
                  </div>
                )}
                <div>
                  <p className="text-lg font-semibold text-foreground">{name}</p>
                  <p className="text-sm text-muted-foreground">{email}</p>
                </div>
              </div>
              <div className="flex gap-2 flex-col">
                <label htmlFor="name" className="font-semibold text-xl">Name</label>
                <input 
                  name="name"
                  id="name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  /* Make the input text readable in both themes */
                  className="border-2 border-border text-foreground w-full p-2 rounded-[var(--radius-button)]
                   hover:border-primary/50 focus:text-foreground focus:border-primary focus:outline-none text-xl"
                   />
              </div>
                
              <div className="flex gap-2 flex-col">
                <label htmlFor="studentNo" className="font-semibold text-xl">Student No</label>
                <input
                  name="studentNo"
                  id="studentNo"
                  type="text"
                  value={studentNo}
                  onChange={e => setStudentNo(e.target.value)}
                  className="border-2 border-border text-foreground w-full p-2 rounded-[var(--radius-button)]
                   hover:border-primary/50 focus:text-foreground focus:border-primary focus:outline-none text-xl"
                />
              </div>

              <div className="flex gap-2 flex-col">
                <label htmlFor="section" className="font-semibold text-xl">Section</label>
                <input
                  name="section"
                  id="section"
                  type="text"
                  value={section}
                  onChange={e => setSection(e.target.value)}
                  className="border-2 border-border text-foreground w-full p-2 rounded-[var(--radius-button)]
                   hover:border-primary/50 focus:text-foreground focus:border-primary focus:outline-none text-xl"
                />
              </div>

                <button 
                onClick={handleChangeProfile}
                className='
                bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/80
                 py-2 w-40 rounded-[var(--radius-button)] font-semibold cursor-pointer'>
                  Save Changes
                </button>

                <div className="flex gap-2 flex-col">
                  <label htmlFor="email" className="font-semibold text-xl">Email</label>
                  {/* Ensure email is visible in both themes */}
                  <p className="text-xl text-foreground">
                    {email}
                  </p>
              </div>
            </div>
        </div>
    </div>
  )
}

export default Profile
