"use client"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import LoginButton from "@/components/LoginButton"

export default function Login() {

    


  return (
    <div className="min-h-screen flex justify-center items-center bg-background">
        <div className="w-full max-w-md px-4">
            <Card className="bg-secondary px-4 border-none">
                <CardHeader>
                    <h2 className="text-center font-bold text-2xl text-white">Sign in</h2>
                    <p className="text-center text-gray-500">Continue with your Google account</p>
                </CardHeader>
               
                <CardContent className="border-b border-gray-300 pb-6">
                    <LoginButton/>
                </CardContent>

                <CardFooter className="flex-col gap-2 text-center text-gray-500">
                    By signing in, you agree to our Terms of Service and
                    Privacy Policy
                </CardFooter>
            </Card>
        </div>
      
    </div>   
  )
}
