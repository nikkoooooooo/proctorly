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
        refetch()
    }

  return (
    <button className="p-2 bg-blue-500 text-white rounded-lg font-semibold cursor-pointer" onClick={handleLogout}>
        Logout
    </button>
  )
}

export default LogoutButton