// "use client"
// import { useRouter } from "next/navigation";
// import { signOut } from "@/lib/auth-actions";
// import { authClient } from "@/client/auth-client";
// function LogoutButton() {
//     const { refetch } = authClient.useSession();
//     const router = useRouter();

//     const handleLogout = async () => {
//         await signOut();

//         await authClient.signOut();

//         router.replace("/login")
//         router.refresh()
//         // refetch()
//     }

//   return (
//     <button className="p-2 bg-blue-500 hover:bg-blue-400 active:bg-blue-300 text-white rounded-lg font-semibold cursor-pointer" onClick={handleLogout}>
//         Logout
//     </button>
//   )
// }

// export default LogoutButton

"use client"
import { authClient } from "@/client/auth-client";
import { useRouter } from "next/navigation";

function LogoutButton() {
    const router = useRouter();

    const handleLogout = async () => {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    // This ensures the client state is wiped BEFORE redirecting
                    router.push("/login");
                    router.refresh(); 
                },
            },
        });
    }

    return (
        <button 
            className="p-2 bg-blue-500 hover:bg-blue-400 text-white rounded-lg" 
            onClick={handleLogout}
        >
            Logout
        </button>
    )
}
export default LogoutButton
