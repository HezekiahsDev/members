"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ACTBotV3 } from "@/components/act-bot-v3" // Updated to V3
import { MessageSquare, X } from "lucide-react"

export function StickyBotCTA() {
  const [isBotOpen, setIsBotOpen] = useState(false)

  // If the user wants the button to link to /bot page instead of opening an embedded bot:
  // return (
  //   <div className="fixed bottom-4 right-4 z-50 font-arial">
  //     <Link href="/bot" passHref>
  //       <Button className="bg-red-600 hover:bg-red-700 text-white rounded-full p-4 shadow-lg hover:scale-110 transition-transform">
  //         <MessageSquare className="mr-2" /> Chat Now
  //       </Button>
  //     </Link>
  //   </div>
  // );

  // For embedded bot:
  if (isBotOpen) {
    return (
      <div className="fixed bottom-0 right-0 md:bottom-4 md:right-4 z-[100] w-full md:w-[400px] h-full md:h-[600px] shadow-2xl bg-white flex flex-col rounded-t-lg md:rounded-lg font-arial">
        <div className="flex justify-end p-2 border-b">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:text-gray-800 w-8 h-8"
            onClick={() => setIsBotOpen(false)}
            aria-label="Close chat"
          >
            <X size={20} />
          </Button>
        </div>
        <div className="flex-grow overflow-hidden">
          <ACTBotV3 isFullScreen={false} initialQuestion={1} />
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 font-arial">
      <Button
        onClick={() => setIsBotOpen(true)}
        className="bg-red-600 hover:bg-red-700 text-white rounded-full py-3 px-5 shadow-lg hover:scale-110 transition-transform flex items-center"
      >
        <MessageSquare size={20} className="mr-2" /> Chat Now
      </Button>
    </div>
  )
}
