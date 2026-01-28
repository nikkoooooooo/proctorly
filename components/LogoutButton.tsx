"use client"
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-actions";
import { authClient } from "@/client/auth-client";
function LogoutButton() {
    const { refetch } = authClient.useSession();
    const router = useRouter();

    const handleLogout = async () => {
        await signOut();
        router.push("/login")
        router.refresh()
        refetch()
    }

  return (
    <button className="p-2 bg-blue-500 hover:bg-blue-400 active:bg-blue-300 text-white rounded-lg font-semibold cursor-pointer" onClick={handleLogout}>
        Logout
    </button>
  )
}

export default LogoutButton