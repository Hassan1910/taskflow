"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"
import Link from "next/link"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const token = searchParams.get("token")
    const email = searchParams.get("email")

    if (!token || !email) {
      setStatus("error")
      setMessage("Invalid verification link")
      return
    }

    verifyEmail(token, email)
  }, [searchParams])

  const verifyEmail = async (token: string, email: string) => {
    try {
      const response = await fetch(
        `/api/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`
      )
      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        setMessage(data.message)
        // Redirect to sign in after 3 seconds
        setTimeout(() => {
          router.push("/auth/signin?verified=true")
        }, 3000)
      } else {
        setStatus("error")
        setMessage(data.error || "Verification failed")
      }
    } catch (error) {
      setStatus("error")
      setMessage("An error occurred during verification")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {status === "loading" && (
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
            )}
            {status === "success" && (
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            )}
            {status === "error" && (
              <XCircle className="h-16 w-16 text-red-500" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {status === "loading" && "Verifying Email..."}
            {status === "success" && "Email Verified!"}
            {status === "error" && "Verification Failed"}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "success" && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Redirecting you to sign in...
              </p>
              <Button asChild className="w-full">
                <Link href="/auth/signin">Sign In Now</Link>
              </Button>
            </div>
          )}
          {status === "error" && (
            <div className="space-y-2">
              <Button asChild variant="outline" className="w-full">
                <Link href="/auth/signin">Back to Sign In</Link>
              </Button>
              <Button asChild className="w-full">
                <Link href="/auth/signup">Create New Account</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

