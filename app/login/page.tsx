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
                    <h2 className="text-center font-bold text-2xl text-foreground">Sign in</h2>
                    <p className="text-center text-muted-foreground">Continue with your Google account</p>
                </CardHeader>
               
                <CardContent className="border-b border-border pb-6">
                    <LoginButton/>
                </CardContent>

                <CardFooter className="flex-col gap-2 text-center text-muted-foreground">
                    By signing in, you agree to our
                    <a href="/terms" className="mx-1 text-foreground hover:underline">Terms &amp; Conditions</a>
                    &amp;
                    <a href="/privacy" className="mx-1 text-foreground hover:underline">Privacy Policy</a>
                </CardFooter>
            </Card>
        </div>
      
    </div>   
  )
}
