import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Users, Zap, BarChart3, Shield, ArrowRight, Star, TrendingUp, Lock, Sparkles } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "TaskFlow - Modern Project Management for Teams",
  description: "Intuitive project management tool that helps teams collaborate, track progress, and deliver results faster. Join 10,000+ happy users with 4.9/5 rating.",
  keywords: ["project management", "task management", "team collaboration", "productivity", "kanban board"],
  openGraph: {
    title: "TaskFlow - Modern Project Management for Teams",
    description: "Manage projects like a pro with TaskFlow. Real-time collaboration, task tracking, and analytics.",
    type: "website",
  },
}

// Memoize static feature data
const FEATURES = [
  {
    icon: CheckCircle2,
    title: "Task Management",
    description: "Create, organize, and track tasks with intuitive drag-and-drop boards",
    color: "bg-blue-500/10",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Work together seamlessly with real-time updates and comments",
    color: "bg-purple-500/10",
  },
  {
    icon: Zap,
    title: "Real-Time Updates",
    description: "See changes instantly as they happen across all devices",
    color: "bg-orange-500/10",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description: "Monitor project health with detailed analytics and insights",
    color: "bg-green-500/10",
  },
] as const

const STATS = [
  { label: "Active Projects", value: "50K+", icon: TrendingUp },
  { label: "Tasks Completed", value: "2M+", icon: CheckCircle2 },
  { label: "Team Members", value: "100K+", icon: Users },
] as const

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">
              TaskFlow
            </span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/auth/signin">
              <Button variant="ghost" className="hidden sm:inline-flex">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="group">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex-1 overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 -z-10 bg-linear-to-br from-primary/5 via-background to-background" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_70%_60%,rgba(120,119,198,0.08),transparent_50%)]" />
        
        <div className="container flex flex-col items-center justify-center gap-8 py-16 px-4 sm:px-6 lg:px-8 md:py-24 lg:py-32 max-w-7xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background px-4 py-1.5 text-sm shadow-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-medium text-foreground">New features added every week</span>
          </div>

          <div className="flex flex-col items-center gap-6 text-center">
            <h1 className="text-4xl font-bold tracking-tighter text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
              Manage Projects
              <br />
              <span className="text-primary">
                Like a Pro
              </span>
            </h1>
            <p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl md:text-2xl">
              TaskFlow is a modern, intuitive project management tool that helps teams
              collaborate, track progress, and deliver results faster.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:gap-4">
              <Link href="/auth/signup">
                <Button size="lg" className="group h-12 w-full px-8 sm:w-auto">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button size="lg" variant="outline" className="h-12 w-full px-8 sm:w-auto">
                  Sign In
                </Button>
              </Link>
            </div>
            
            {/* Social Proof */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-linear-to-br from-primary/30 to-primary/50" />
                  ))}
                </div>
                <span className="font-medium text-foreground">10,000+ happy users</span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
                <span className="ml-1 font-medium text-foreground">4.9/5 rating</span>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-16 grid w-full max-w-4xl gap-4 sm:grid-cols-3">
            {STATS.map((stat) => (
              <Card key={stat.label} className="border-primary/20 bg-card shadow-sm">
                <CardContent className="flex flex-col items-center gap-2 p-6">
                  <stat.icon className="h-8 w-8 text-primary" />
                  <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Features Grid */}
          <div className="mt-20 w-full">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Everything you need to succeed
              </h2>
              <p className="mt-3 text-lg text-muted-foreground">
                Powerful features to help your team stay organized and productive
              </p>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((feature) => (
                <Card 
                  key={feature.title}
                  className="group cursor-pointer border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
                >
                  <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${feature.color} transition-transform group-hover:scale-110`}>
                      <feature.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg text-foreground">{feature.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-20 w-full">
            <Card className="border-primary/20 bg-card shadow-lg">
              <CardContent className="flex flex-col items-center gap-6 p-12 text-center">
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  Ready to boost your productivity?
                </h2>
                <p className="max-w-[600px] text-lg text-muted-foreground">
                  Join thousands of teams already using TaskFlow to manage their projects efficiently
                </p>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Link href="/auth/signup">
                    <Button size="lg" className="group h-12 px-8">
                      Start Free Trial
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span className="font-medium text-foreground">No credit card required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-primary" />
                    <span className="font-medium text-foreground">14-day free trial</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background py-8 md:py-12">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-primary">
                TaskFlow
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 TaskFlow. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-primary" />
              <span className="font-medium text-foreground">Secure & Private</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
