"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Global error:", error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-red-50/30 to-slate-50 dark:from-slate-950 dark:via-red-950/30 dark:to-slate-950 p-4">
      <Card className="w-full max-w-2xl shadow-2xl border-red-200 dark:border-red-900">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl text-red-600 dark:text-red-400">
            Something went wrong!
          </CardTitle>
          <CardDescription>
            We encountered an unexpected error. Please try again.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error.message && (
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900 rounded-lg p-4">
              <p className="font-mono text-sm text-red-800 dark:text-red-200 break-all">
                {error.message}
              </p>
            </div>
          )}

          {error.digest && (
            <p className="text-xs text-center text-muted-foreground">
              Error ID: <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{error.digest}</code>
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={reset}
              className="flex-1"
              variant="default"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button
              onClick={() => (window.location.href = "/dashboard")}
              className="flex-1"
              variant="outline"
            >
              <Home className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground pt-2">
            If this problem persists, please contact support.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

