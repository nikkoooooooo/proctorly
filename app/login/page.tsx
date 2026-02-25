"use client"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import LoginButton from "@/components/LoginButton"

export default function Login() {
  return (
    <div className="min-h-screen flex justify-center items-center bg-background">
      <div className="w-full max-w-md px-4">
        <Card className="border border-border/60 bg-secondary/30 p-2 shadow-sm">
          <CardHeader className="space-y-3 text-center">
            <div className="space-y-2">
              <CardTitle className="text-2xl font-semibold text-foreground">
                Sign in to{" "}
                <span className="font-semibold tracking-tight">Proctorly</span>
                <span className="ml-0.5 font-medium text-primary">X</span>
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Continue with your Google account to access your dashboard.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="pt-2 pb-6">
            <LoginButton />
          </CardContent>

          <CardFooter className="flex-col gap-2 text-center text-xs text-muted-foreground border-t border-border/60 pt-5">
            <span>By signing in, you agree to our</span>
            <span>
              <a href="/terms" className="text-foreground hover:underline">Terms &amp; Conditions</a>
              {" "}and{" "}
              <a href="/privacy" className="text-foreground hover:underline">Privacy Policy</a>
            </span>
          </CardFooter>
        </Card>
      </div>
    </div>   
  )
}
