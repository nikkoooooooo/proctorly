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
import { updateName } from "@/lib/user/actions/updateName"
import { authClient } from "@/client/auth-client"
import toast from "react-hot-toast"

function profile() {
    const [name, setName] = useState("username")
    const [email, setEmail] = useState("username@gmail.com")

    const [sessionId, setSessionId] = useState<string | null>(null)

    const { data } = authClient.useSession()

    // if (data) {
    //       setSession(data?.session.id)
    // }

     // Get session ID safely
    useEffect(() => {
      if (data?.session?.id) {
        setSessionId(data.session.id)
      }
  }, [data])



   useEffect(() => {
    if (!sessionId) return
    const fetchName = async () => {
      try {
        const data = await getUserBySessionIdAction(sessionId)
        if (data.data?.user.name && data.data?.user.email) {
            setName(data.data.user.name)
            setEmail(data.data.user.email)
        }
      } catch (error) {
        console.error(error)
      }
    }
    fetchName()
   },[sessionId])


   const handleChangeName = async () => {
    try {
      if (!name || !data?.session.userId) return
      await updateName(
        {
          newName: name,
          userId: data?.session.userId 
        }
      )
      toast.success("Name updated successfully!")
    } catch (error) {
      console.error(error)
      toast.error("Could not update name. Try again.")

    }
      
   }

  return (
    <div className='min-h-screen flex justify-center'>
        <div className='max-w-2xl w-full flex flex-col items-center m-4'>
            {/* Use theme border + radius so the card looks right in light mode */}
            <div className='mt-5 flex flex-col w-full gap-4 border border-border p-4 rounded-[var(--radius-card)]'>
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
                
                <button 
                onClick={handleChangeName}
                className='
                bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/80
                 py-2 w-32 rounded-[var(--radius-button)] font-semibold cursor-pointer'>
                  Save Changes
                </button>

                <div className="flex gap-2 flex-col">
                  <label htmlFor="name" className="font-semibold text-xl">Email</label>
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

export default profile
