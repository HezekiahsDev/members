"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { X } from "lucide-react"
import Link from "next/link"

export function ExitIntentPopup() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      // Basic exit intent: mouse leaves top of viewport
      if (e.clientY <= 0 && !sessionStorage.getItem("exitIntentShown")) {
        setIsVisible(true)
        sessionStorage.setItem("exitIntentShown", "true") // Show only once per session
      }
    }

    // Fallback: show after 5 seconds if no exit intent detected (as per original spec)
    const timer = setTimeout(() => {
      if (!sessionStorage.getItem("exitIntentShown")) {
        setIsVisible(true)
        sessionStorage.setItem("exitIntentShown", "true")
      }
    }, 5000)

    document.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave)
      clearTimeout(timer)
    }
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200] p-4 font-arial">
      <Card className="w-full max-w-md relative shadow-2xl">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 w-8 h-8"
          onClick={() => setIsVisible(false)}
          aria-label="Close popup"
        >
          <X size={20} />
        </Button>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-red-700">Leaving Already?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-700 mb-1">Don't miss out on your chance to</p>
          <p className="text-center text-red-600 font-semibold text-lg mb-4">Boost Your Business Growth by 20-30%!</p>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-3">
          <Link href="/bot" passHref>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white animate-wiggle hover:scale-110 transition-transform font-bold py-3 px-6 text-base"
              onClick={() => setIsVisible(false)}
            >
              Start Your Free Consult
            </Button>
          </Link>
          <Button variant="link" className="text-xs text-gray-500" onClick={() => setIsVisible(false)}>
            No thanks, I'm not interested in growth
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
