import { Button } from "@/components/ui/button"
import { ExitIntentPopup } from "@/components/exit-intent-popup" // Assuming this is updated per spec
import { LoginSection } from "@/components/login-section" // Assuming this is updated per spec
import { TrustSignals } from "@/components/trust-signals" // Assuming this is updated per spec
import { RecentWins } from "@/components/recent-wins" // Assuming this is updated per spec
import { StickyBotCTA } from "@/components/sticky-bot-cta" // Assuming this is updated per spec
import Link from "next/link"
import Image from "next/image"

export default function Home() {
  return (
    <main className="min-h-screen bg-white font-arial">
      {" "}
      {/* Arial font for whole page */}
      {/* Login Section - Top right as per common layouts, not specified but implied */}
      <div className="absolute top-4 right-4 z-20">
        <LoginSection />
      </div>
      {/* Navigation Bar - Simplified based on new structure */}
      <nav className="flex items-center justify-center p-4 bg-white shadow-sm relative">
        <div className="flex flex-col items-center">
          <Image
            src="/icons/kefford-k-logo.png"
            alt="Kefford Consulting Logo"
            width={60}
            height={60}
            className="mb-1"
          />
          <span className="text-xl font-bold text-gray-800 font-arial">Kefford Consulting</span>
          <p className="text-lg text-red-600 font-bold font-arial">You type, we ACT</p> {/* Arial Bold 20pt */}
        </div>
      </nav>
      <div className="flex items-center justify-between p-4 bg-white shadow-sm sticky top-0 z-10">
        <div>{/* Can add mobile menu toggle here if K logo is not the main nav element */}</div>
        <div className="flex space-x-6 font-arial text-sm">
          {" "}
          {/* Arial 14pt */}
          <Link href="/" className="text-red-600 hover:text-red-800">
            Home
          </Link>
          <Link href="/bot" className="text-red-600 hover:text-red-800">
            Bot Consult
          </Link>
          <Link href="/faq" className="text-red-600 hover:text-red-800">
            FAQ
          </Link>
          <Link href="/members" className="text-red-600 hover:text-red-800">
            Members Login
          </Link>
          <Link href="/contact" className="text-red-600 hover:text-red-800">
            Contact
          </Link>
        </div>
        <div></div> {/* Placeholder for right alignment if needed */}
      </div>
      {/* Hero Section */}
      <section className="bg-red-600 text-white py-20 px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 font-arial">
          {" "}
          {/* Arial Bold 24pt */}
          Boost Your Business Growth by 20-30%—Start Your Free Consult Now!
        </h1>
        <Link href="/bot" passHref>
          <Button className="bg-white text-red-600 hover:bg-gray-100 hover:scale-110 transition-transform animate-wiggle font-bold py-3 px-8 rounded-md text-lg font-arial">
            Start Free Consult
          </Button>
        </Link>
      </section>
      <TrustSignals />
      <RecentWins />
      <StickyBotCTA />
      <ExitIntentPopup />
    </main>
  )
}
