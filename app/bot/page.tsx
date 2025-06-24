"use client"

import { ACTBotV3 } from "@/components/act-bot-v3" // Updated to V3

export default function BotPage() {
  // Retrieve query params if needed for starting question or referrer
  // const searchParams = useSearchParams();
  // const startQuestion = searchParams.get('startBotAt');
  // const referrer = searchParams.get('ref');

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-0 md:p-4 font-arial">
      {/* The ACTBotV3 component will take full screen if isFullScreen is true */}
      <ACTBotV3 isFullScreen={true} initialQuestion={1} />
    </div>
  )
}
