"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChromeIcon } from "lucide-react" // Example for Gmail OAuth icon

export function LoginSection() {
  const [isLoginOpen, setIsLoginOpen] = useState(false)

  // Mock login/signup functions
  const handleLogin = () => alert("Login logic (mocked)")
  const handleSignup = () => alert("Signup logic (mocked)")
  const handleGmailOAuth = () => alert("Gmail OAuth (mocked)")

  if (!isLoginOpen) {
    return (
      <Button
        onClick={() => setIsLoginOpen(true)}
        className="bg-red-600 hover:bg-red-700 text-white animate-wiggle hover:scale-110 transition-transform font-arial"
      >
        Join Now
      </Button>
    )
  }

  return (
    <Card className="w-full max-w-sm shadow-xl font-arial">
      <CardHeader>
        <CardTitle className="text-xl text-center">Login or Sign Up</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="email-login" className="text-xs font-medium text-gray-700">
            Email
          </label>
          <Input id="email-login" type="email" placeholder="you@example.com" />
        </div>
        <div>
          <label htmlFor="password-login" className="text-xs font-medium text-gray-700">
            Password
          </label>
          <Input id="password-login" type="password" placeholder="••••••••" />
        </div>
        <Button onClick={handleLogin} className="w-full bg-red-600 hover:bg-red-700 text-white">
          Login
        </Button>
        <Button variant="outline" onClick={handleSignup} className="w-full">
          Sign Up
        </Button>
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">Or continue with</span>
          </div>
        </div>
        <Button variant="outline" onClick={handleGmailOAuth} className="w-full">
          <ChromeIcon className="mr-2 h-4 w-4" /> {/* Placeholder for Gmail icon */}
          Sign in with Gmail
        </Button>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button variant="ghost" size="sm" onClick={() => setIsLoginOpen(false)}>
          Cancel
        </Button>
      </CardFooter>
    </Card>
  )
}
