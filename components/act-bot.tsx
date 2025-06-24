"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { LightbulbIcon, ArrowLeft, Volume2, VolumeX } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

// Types for bot state
type BotState = {
  currentQuestion: number
  userData: UserData
  messages: Message[]
  loading: boolean
  error: string | null
  progress: number
  potentialSavings: number
  timeSaved: number
  showLightbulb: boolean
  soundEnabled: boolean
  backButtonEnabled: boolean
}

type UserData = {
  client_first_name: string
  client_last_name: string
  business_name: string
  location: string
  industry_type: string
  profession: string
  daily_tasks: string
  email: string
  purchase: string
  challenge: string
  business_size: string
  business_stage: string
  primary_issue: string
  secondary_issue: string
  limits: string
  dream_outcome: string
  success_metric: string
  settle_outcome: string
  strengths: string
  challenge_start: string
  root_cause: string
  budget: string
  urgency: string
  final_purchase: string
  support_calls: string
}

type Message = {
  type: "bot" | "user"
  content: string
}

export function ACTBot({ initialQuestion = 1, isFullScreen = false, referrer_name = "" }) {
  const [state, setState] = useState<BotState>({
    currentQuestion: initialQuestion,
    userData: {
      client_first_name: "",
      client_last_name: "",
      business_name: "",
      location: "",
      industry_type: "",
      profession: "",
      daily_tasks: "",
      email: "",
      purchase: "",
      challenge: "",
      business_size: "",
      business_stage: "",
      primary_issue: "",
      secondary_issue: "",
      limits: "",
      dream_outcome: "",
      success_metric: "",
      settle_outcome: "",
      strengths: "",
      challenge_start: "",
      root_cause: "",
      budget: "",
      urgency: "",
      final_purchase: "",
      support_calls: "",
    },
    messages: [],
    loading: false,
    error: null,
    progress: 5,
    potentialSavings: 0,
    timeSaved: 0,
    showLightbulb: false,
    soundEnabled: true,
    backButtonEnabled: false,
  })

  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Sound effects
  const sounds = {
    whistle: "/sounds/whistle.mp3",
    chaChing: "/sounds/cha-ching.mp3",
    stopwatch: "/sounds/stopwatch.mp3",
    cheering: "/sounds/cheering.mp3",
  }

  // Progress messages
  const progressMessages = [
    "Let's kick things off!",
    "Getting to know you...",
    "Let's make it official...",
    "Choose your path...",
    "What's your hurdle?",
    "Sizing up...",
    "Unpacking your challenge...",
    "What's in your toolbox...",
    "Dream big...",
    "Fueling your dream...",
    "Tracing the roots...",
    "Finding the cause...",
    "Planning your investment...",
    "Timing is everything...",
    "Your solution awaits...",
    "Boost your plan...",
    "Secure your success...",
    "You're all set!",
  ]

  // Lightbulb tooltips
  const lightbulbTooltips = [
    "Share your full name to start your journey—e.g., 'John Doe.' This helps us personalize your experience!",
    "Include your business name, city, industry, and a key daily task—e.g., 'Acme Plumbing, Boise, Trades. I'm a plumber, focusing on pipe repairs and client follow-ups.' This helps us personalize your growth plan!",
    "Use your business email to unlock exclusive tools—e.g., 'info@acmeplumbing.com.' This ensures secure access to your personalized plan!",
    "Choose a plan that fits your goals—e.g., Play for quick wins, Premium for full support with 3 months of calls. Most professionals pick Growth for lasting results!",
    "Pick a challenge and explain its urgency—e.g., 'Sales: We're losing $5K/month due to low leads, and I have 3 employees counting on growth.' Be specific to ensure the best recommendations!",
    "Consider your business's current state—e.g., 'Growing Fast: We're gaining clients but can't keep up with demand.' This helps us tailor your recommendations!",
    "Focus on the biggest hurdle and a secondary concern—e.g., 'Slow sales: We're losing $2K/month, and my team's burnout is reducing productivity.' Be specific to help us address your needs!",
    "Highlight your top skill and a key constraint. E.g., for plumbers: 'We're known for expert pipe repairs with a 98% customer satisfaction rate, but lack a website to attract new clients.' For accountants: 'We deliver precise audits with zero errors, but struggle with a small marketing budget to reach new businesses.'",
    "Define your ideal goal, key metric, and minimum target—e.g., 'Double revenue to $50K/month, track revenue growth, settle for adding $10K.' This helps us set clear objectives for your plan!",
    "Highlight strengths that address your challenge—e.g., 'We have a loyal client base with 90% retention, and our expertise ensures quick solutions.' This helps us tailor your strategy!",
    "Think about a specific event that triggered this challenge—e.g., 'Six months ago, a key client left due to pricing issues, impacting our revenue.' Focus on the timing and root cause to help us tailor your solution!",
    "Identify the main cause and a secondary factor—e.g., 'Lack of training: Staff can't handle new clients, plus our weak online presence limits visibility.' This ensures we address the root issues!",
    "Specify your budget to ensure tailored recommendations—e.g., '$1,000 one-time' or 'Flexible: I'm open to investing for the right solution.' This helps us personalize the recommendations!",
    "Specify the urgency to prioritize your plan—e.g., 'Immediate: Losing clients in 30 days, costing $3K/month.' This ensures we act fast where needed and provide more gradual growth if time allows!",
    "Upgrade for faster results—e.g., Premium offers a Consult plus 3 months of support to achieve your goals. 80% of professionals see 30%+ growth with Growth or Premium!",
    "Upgrade to accelerate your solution—e.g., Growth offers 3 months of support to drive significant savings. 80% of users upgrade for faster results!",
    "88% of customers add Support Calls to protect their investment and ensure successful results.",
    "Confirm your purchase to start growing—your purchase is ready to deliver significant savings!",
  ]

  // Initialize bot with first question
  useEffect(() => {
    const firstQuestion = referrer_name
      ? `Hi, I'm A.C.T.! Your friend ${referrer_name} invited you—let's spark 20-30%+ growth for your business! What's your name?`
      : "Hi, I'm A.C.T., your Automated Consultant Toolkit. We're here to spark 20-30%+ growth for your business! Let's start with an easy one, what's your name?"

    setState((prev) => ({
      ...prev,
      messages: [{ type: "bot", content: firstQuestion }],
    }))

    // Play whistle sound on first load
    if (initialQuestion === 1) {
      playSound(sounds.whistle)
    }

    // Set up session timeout
    const timeoutId = setTimeout(
      () => {
        // This would handle the 10-minute timeout logic
      },
      10 * 60 * 1000,
    )

    return () => clearTimeout(timeoutId)
  }, [initialQuestion, referrer_name])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [state.messages])

  // Focus input when question changes
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    } else if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [state.currentQuestion])

  // Play sound effect
  const playSound = (soundUrl: string) => {
    if (state.soundEnabled && audioRef.current) {
      audioRef.current.src = soundUrl
      audioRef.current.play().catch((e) => console.error("Error playing sound:", e))
    }
  }

  // Toggle sound
  const toggleSound = () => {
    setState((prev) => ({
      ...prev,
      soundEnabled: !prev.soundEnabled,
    }))
  }

  // Handle user input submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Get input value based on current question
    let inputValue = ""
    if (inputRef.current) {
      inputValue = inputRef.current.value
    } else if (textareaRef.current) {
      inputValue = textareaRef.current.value
    }

    if (!inputValue.trim()) {
      setState((prev) => ({ ...prev, error: "Please provide an answer" }))
      return
    }

    // Add user message
    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, { type: "user", content: inputValue }],
      loading: true,
      error: null,
    }))

    // Process the answer based on current question
    try {
      await processAnswer(inputValue)
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "An error occurred. Please try again.",
      }))
    }
  }

  // Process user's answer and move to next question
  const processAnswer = async (answer: string) => {
    // Clear input fields
    if (inputRef.current) {
      inputRef.current.value = ""
    }
    if (textareaRef.current) {
      textareaRef.current.value = ""
    }

    let nextQuestion = state.currentQuestion + 1
    const updatedUserData = { ...state.userData }
    let botResponse = ""
    let updatedPotentialSavings = state.potentialSavings
    let updatedTimeSaved = state.timeSaved
    let soundToPlay = ""
    let backButtonEnabled = state.currentQuestion >= 5 && state.currentQuestion < 18

    // Process based on current question
    switch (state.currentQuestion) {
      case 1: // Name
        const nameParts = answer.trim().split(" ")
        updatedUserData.client_first_name = nameParts[0]
        updatedUserData.client_last_name = nameParts.length > 1 ? nameParts.slice(1).join(" ") : ""

        botResponse = `Great to meet you, ${updatedUserData.client_first_name}! I'm excited to help you succeed.`

        // Easter egg for "ACTFAST"
        if (answer.toUpperCase() === "ACTFAST") {
          nextQuestion = 18
          updatedUserData.purchase = "Test Playbook"
          updatedUserData.final_purchase = "Test Playbook"
          updatedPotentialSavings = 0
        }
        break

      case 2: // Business and Role
        // Extract business details using simple parsing
        // In a real implementation, this would use more sophisticated NLP
        const businessInfo = answer.split(",")
        if (businessInfo.length >= 3) {
          updatedUserData.business_name = businessInfo[0].trim()
          updatedUserData.location = businessInfo[1].trim()
          updatedUserData.industry_type = businessInfo[2].trim()

          // Extract profession and daily tasks from the rest
          const roleInfo = businessInfo.slice(3).join(",")
          const roleMatch = roleInfo.match(/I'm a ([^,.]+)/)
          if (roleMatch) {
            updatedUserData.profession = roleMatch[1].trim()
          }
          updatedUserData.daily_tasks = roleInfo
        }

        botResponse = `Thanks, ${updatedUserData.client_first_name}! What a vibrant business. I'm excited to learn more about your needs.`
        break

      case 3: // Registration
        updatedUserData.email = answer
        botResponse = `Awesome, ${updatedUserData.client_first_name}! Preparing your account in our Members Only Area`
        break

      case 4: // Initial Selection
        updatedUserData.purchase = answer
        botResponse = `Brilliant choice, ${updatedUserData.client_first_name}! Let's take care of your needs...`

        // Skip to Q15 for Growth/Premium
        if (answer === "Growth" || answer === "Premium") {
          nextQuestion = 15
        }

        // Set initial ROI values based on selection
        if (answer === "Play") {
          updatedPotentialSavings = 500
          updatedTimeSaved = 2
        } else if (answer === "Playbook") {
          updatedPotentialSavings = 1500
          updatedTimeSaved = 5
        } else if (answer === "Starter") {
          updatedPotentialSavings = 750
          updatedTimeSaved = 3
        } else if (answer === "Growth") {
          updatedPotentialSavings = 2000
          updatedTimeSaved = 8
        } else if (answer === "Premium") {
          updatedPotentialSavings = 4000
          updatedTimeSaved = 12
        }

        soundToPlay = sounds.stopwatch
        break

      case 5: // Challenge
        updatedUserData.challenge = answer

        // Extract business size if mentioned
        const employeeMatch = answer.match(/(\d+)\s*employees?/)
        if (employeeMatch) {
          updatedUserData.business_size = employeeMatch[1]
        }

        botResponse = `${updatedUserData.challenge}? We've got oodles of solutions surrounding that one, ${updatedUserData.client_first_name}. Let's dive deeper...`

        // Adjust ROI based on challenge
        if (answer.toLowerCase().includes("sales") || answer.toLowerCase().includes("hiring")) {
          updatedPotentialSavings += 3000
          updatedTimeSaved += 5
          soundToPlay = sounds.chaChing
        } else if (answer.toLowerCase().includes("branding") || answer.toLowerCase().includes("digital")) {
          updatedPotentialSavings += 2000
          updatedTimeSaved += 4
          soundToPlay = sounds.chaChing
        } else if (answer.toLowerCase().includes("partnerships") || answer.toLowerCase().includes("cost")) {
          updatedPotentialSavings += 1500
          updatedTimeSaved += 3
          soundToPlay = sounds.chaChing
        } else {
          updatedPotentialSavings += 1000
          updatedTimeSaved += 2
          soundToPlay = sounds.stopwatch
        }
        break

      case 6: // Business Stage
        updatedUserData.business_stage = answer
        botResponse = `Got it, ${updatedUserData.client_first_name}. We're shaping your plan...`

        // Adjust ROI based on business stage
        if (answer === "Growing Fast") {
          updatedPotentialSavings += 2000
          updatedTimeSaved += 2
          soundToPlay = sounds.chaChing
        } else if (answer === "Stable") {
          updatedPotentialSavings += 1500
          updatedTimeSaved += 1.5
          soundToPlay = sounds.chaChing
        } else if (answer === "Struggling") {
          updatedPotentialSavings += 1000
          updatedTimeSaved += 1
          soundToPlay = sounds.chaChing
        }
        break

      // Continue with cases 7-18...
      case 7: // Problem Deep-Dive (Issues)
        // Split into primary and secondary issues
        const issues = answer.split(",")
        updatedUserData.primary_issue = issues[0].trim()
        updatedUserData.secondary_issue = issues.length > 1 ? issues.slice(1).join(",").trim() : ""

        botResponse = `That's tough, ${updatedUserData.client_first_name}. Thanks for sharing the details. We're going to help...`

        // Adjust ROI based on keywords
        if (answer.toLowerCase().includes("clients")) {
          updatedPotentialSavings += 200
          updatedTimeSaved += 0.5
          soundToPlay = sounds.chaChing
        } else {
          soundToPlay = sounds.stopwatch
        }
        break

      case 8: // Problem Deep-Dive (Limits)
        updatedUserData.limits = answer
        botResponse = `I hear you, ${updatedUserData.client_first_name}. We'll keep this in mind and work with what we've got...`

        // Adjust ROI based on keywords
        if (answer.toLowerCase().includes("budget")) {
          updatedPotentialSavings += 100
          updatedTimeSaved += 0.3
          soundToPlay = sounds.chaChing
        } else {
          soundToPlay = sounds.stopwatch
        }
        break

      case 9: // Problem Deep-Dive (Dream Outcome)
        // Parse dream outcome, success metric, and settle outcome
        const outcomes = answer.split(",")
        updatedUserData.dream_outcome = outcomes[0].trim()

        if (outcomes.length > 1) {
          updatedUserData.success_metric = outcomes[1].trim()
        }

        if (outcomes.length > 2) {
          updatedUserData.settle_outcome = outcomes[2].trim()
        }

        botResponse = `Inspiring, ${updatedUserData.client_first_name}! We're thrilled to make it happen...`

        // Adjust ROI based on keywords
        if (answer.toLowerCase().includes("sales")) {
          updatedPotentialSavings += 300
          updatedTimeSaved += 0.5
          soundToPlay = sounds.chaChing
        } else {
          soundToPlay = sounds.stopwatch
        }
        break

      case 10: // Problem Deep-Dive (Strengths)
        updatedUserData.strengths = answer
        botResponse = `That's a solid foundation, ${updatedUserData.client_first_name}! Let's build on it...`

        // Adjust ROI based on keywords
        if (answer.toLowerCase().includes("service")) {
          updatedPotentialSavings += 200
          updatedTimeSaved += 0.5
          soundToPlay = sounds.chaChing
        } else {
          soundToPlay = sounds.stopwatch
        }
        break

      case 11: // Problem Deep-Dive (Challenge Start)
        updatedUserData.challenge_start = answer
        botResponse = `Thanks for that. Sorry to hear, ${updatedUserData.client_first_name}. On the bright side, we've now got a clearer understanding of the problems, and are over halfway to your solutions...`

        // Adjust ROI based on keywords
        if (answer.toLowerCase().includes("client")) {
          updatedPotentialSavings += 200
          updatedTimeSaved += 0.5
          soundToPlay = sounds.chaChing
        } else {
          soundToPlay = sounds.stopwatch
        }
        break

      case 12: // Problem Deep-Dive (Root Cause)
        updatedUserData.root_cause = answer
        botResponse = `Tough but not insurmountable. You're doing a great job helping me focus on the details, ${updatedUserData.client_first_name}. Let's keep going...`

        // Adjust ROI based on keywords
        if (answer.toLowerCase().includes("training")) {
          updatedPotentialSavings += 200
          updatedTimeSaved += 0.5
          soundToPlay = sounds.chaChing
        } else {
          soundToPlay = sounds.stopwatch
        }
        break

      case 13: // Upsell Prep (Budget)
        updatedUserData.budget = answer
        botResponse = `Perfect, ${updatedUserData.client_first_name}. We're almost there...`
        soundToPlay = sounds.chaChing
        break

      case 14: // Upsell Prep (Urgency)
        updatedUserData.urgency = answer
        botResponse = `That's it! The hard part's done, ${updatedUserData.client_first_name}. Let's get to your solution...`

        // Adjust ROI based on urgency
        if (answer === "Immediate (30 days)") {
          updatedPotentialSavings += 300
          updatedTimeSaved += 1
        } else if (answer === "Short-Term (60 days)") {
          updatedPotentialSavings += 200
          updatedTimeSaved += 0.5
        } else if (answer === "Longer-Term (90+ days)") {
          updatedPotentialSavings += 100
          updatedTimeSaved += 0.3
        }

        soundToPlay = sounds.stopwatch
        break

      case 15: // Dynamic Upsell (Bundles)
        if (answer === "Premium") {
          updatedUserData.final_purchase = "Premium"
          updatedPotentialSavings += 3000
          updatedTimeSaved += 3
          nextQuestion = 18 // Skip to confirmation
        } else if (answer === "Growth") {
          updatedUserData.final_purchase = "Growth"
          updatedPotentialSavings += 2000
          updatedTimeSaved += 2
        } else {
          updatedUserData.final_purchase = updatedUserData.purchase
        }

        botResponse = `Here's how we'll win, ${updatedUserData.client_first_name}...`
        soundToPlay = sounds.chaChing
        break

      case 16: // Dynamic Upsell (Bundles)
        if (answer.includes("Upgrade")) {
          if (answer.includes("Starter")) {
            updatedUserData.final_purchase = "Starter"
            updatedPotentialSavings += 1000
            updatedTimeSaved += 1
          } else if (answer.includes("Growth")) {
            updatedUserData.final_purchase = "Growth"
            updatedPotentialSavings += 2000
            updatedTimeSaved += 2
          }
          soundToPlay = sounds.chaChing
        } else {
          updatedUserData.final_purchase = updatedUserData.purchase
        }

        botResponse = `Smart move, ${updatedUserData.client_first_name}! Last question...`
        break

      case 17: // Dynamic Upsell (Support Calls)
        updatedUserData.support_calls = answer
        botResponse = `You're set for success, ${updatedUserData.client_first_name}!`

        if (answer === "1 Month ($300)" || answer === "3 Months ($750)") {
          updatedPotentialSavings += 600
          updatedTimeSaved += 1
        }
        break

      case 18: // Confirmation
        // This would normally redirect to payment
        botResponse = `How good was that?! You've got this, ${updatedUserData.client_first_name}!`
        soundToPlay = sounds.cheering
        backButtonEnabled = false
        break
    }

    // Simulate bot typing delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Update state with new data
    setState((prev) => ({
      ...prev,
      currentQuestion: nextQuestion,
      userData: updatedUserData,
      messages: [...prev.messages, { type: "bot", content: botResponse }],
      loading: false,
      progress: Math.min(90, nextQuestion * 5),
      potentialSavings: updatedPotentialSavings,
      timeSaved: updatedTimeSaved,
      backButtonEnabled,
    }))

    // Play sound effect if needed
    if (soundToPlay) {
      playSound(soundToPlay)
    }
  }

  // Handle button click for multiple choice questions
  const handleButtonClick = (answer: string) => {
    if (inputRef.current) {
      inputRef.current.value = answer
    } else if (textareaRef.current) {
      textareaRef.current.value = answer
    }

    handleSubmit({ preventDefault: () => {} } as React.FormEvent)
  }

  // Go back to previous question
  const handleBack = () => {
    if (state.currentQuestion > 5) {
      setState((prev) => ({
        ...prev,
        currentQuestion: prev.currentQuestion - 1,
        messages: prev.messages.slice(0, -2), // Remove last user and bot message
        backButtonEnabled: prev.currentQuestion - 1 > 5,
      }))
    }
  }

  // Toggle lightbulb tooltip
  const toggleLightbulb = () => {
    setState((prev) => ({
      ...prev,
      showLightbulb: !prev.showLightbulb,
    }))
  }

  // Render current question input based on question number
  const renderQuestionInput = () => {
    const q = state.currentQuestion

    // Special case for Q18 (confirmation)
    if (q === 18) {
      return (
        <Button
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded animate-pulse"
          onClick={() => handleButtonClick("Confirm")}
        >
          Confirm Purchase
        </Button>
      )
    }

    // Multiple choice questions
    if (q === 4) {
      return (
        <div className="grid grid-cols-2 gap-2 mt-4">
          <Button variant="outline" className="border-gray-400" onClick={() => handleButtonClick("Play")}>
            Play
          </Button>
          <Button
            variant="outline"
            className="border-red-600 animate-wiggle hover:scale-110 transition-transform"
            onClick={() => handleButtonClick("Playbook")}
          >
            Playbook
          </Button>
          <Button
            variant="outline"
            className="border-red-600 animate-wiggle hover:scale-110 transition-transform"
            onClick={() => handleButtonClick("Starter")}
          >
            Starter
          </Button>
          <Button
            variant="outline"
            className="border-red-600 animate-wiggle hover:scale-110 transition-transform"
            onClick={() => handleButtonClick("Growth")}
          >
            Growth
          </Button>
          <Button
            variant="outline"
            className="border-red-600 animate-wiggle hover:scale-110 transition-transform"
            onClick={() => handleButtonClick("Premium")}
          >
            Premium
          </Button>
          <Button variant="outline" className="border-gray-400" onClick={() => handleButtonClick("FAQ")}>
            FAQ
          </Button>
        </div>
      )
    }

    if (q === 6) {
      return (
        <div className="grid grid-cols-3 gap-2 mt-4">
          <Button
            variant="outline"
            className="border-red-600 hover:scale-110 transition-transform"
            onClick={() => handleButtonClick("Growing Fast")}
          >
            Growing Fast
          </Button>
          <Button
            variant="outline"
            className="border-red-600 hover:scale-110 transition-transform"
            onClick={() => handleButtonClick("Stable")}
          >
            Stable
          </Button>
          <Button
            variant="outline"
            className="border-red-600 hover:scale-110 transition-transform"
            onClick={() => handleButtonClick("Struggling")}
          >
            Struggling
          </Button>
        </div>
      )
    }

    if (q === 13) {
      return (
        <div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            <Button
              variant="outline"
              className="border-red-600 hover:scale-110 transition-transform"
              onClick={() => handleButtonClick("Limited Budget")}
            >
              Limited Budget
            </Button>
            <Button
              variant="outline"
              className="border-red-600 hover:scale-110 transition-transform"
              onClick={() => handleButtonClick("$1,000-$2,500")}
            >
              $1,000-$2,500
            </Button>
            <Button
              variant="outline"
              className="border-red-600 hover:scale-110 transition-transform"
              onClick={() => handleButtonClick("Over $2,500")}
            >
              Over $2,500
            </Button>
            <Button
              variant="outline"
              className="border-red-600 hover:scale-110 transition-transform"
              onClick={() => handleButtonClick("Flexible")}
            >
              Flexible
            </Button>
          </div>
          <form onSubmit={handleSubmit} className="mt-4">
            <Input ref={inputRef} placeholder="E.g., $1,000 one-time." className="border-red-600 focus:ring-red-600" />
            <Button type="submit" className="mt-2 bg-red-600 hover:bg-red-700 text-white">
              Submit
            </Button>
          </form>
        </div>
      )
    }

    if (q === 14) {
      return (
        <div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            <Button
              variant="outline"
              className="border-red-600 hover:scale-110 transition-transform"
              onClick={() => handleButtonClick("Immediate (30 days)")}
            >
              Immediate (30 days)
            </Button>
            <Button
              variant="outline"
              className="border-red-600 hover:scale-110 transition-transform"
              onClick={() => handleButtonClick("Short-Term (60 days)")}
            >
              Short-Term (60 days)
            </Button>
            <Button
              variant="outline"
              className="border-red-600 hover:scale-110 transition-transform"
              onClick={() => handleButtonClick("Longer-Term (90+ days)")}
            >
              Longer-Term (90+ days)
            </Button>
          </div>
          <form onSubmit={handleSubmit} className="mt-4">
            <Input
              ref={inputRef}
              placeholder="E.g., Losing clients in 30 days."
              className="border-red-600 focus:ring-red-600"
            />
            <Button type="submit" className="mt-2 bg-red-600 hover:bg-red-700 text-white">
              Submit
            </Button>
          </form>
        </div>
      )
    }

    if (q === 15) {
      const options = []

      if (state.userData.budget === "Over $2,500" || state.userData.urgency === "Immediate (30 days)") {
        options.push(
          <Button
            key="premium"
            variant="outline"
            className="border-red-600 animate-wiggle hover:scale-110 transition-transform"
            onClick={() => handleButtonClick("Premium")}
          >
            Premium ($4,000)
          </Button>,
        )
      } else {
        options.push(
          <Button
            key="growth"
            variant="outline"
            className="border-red-600 animate-wiggle hover:scale-110 transition-transform"
            onClick={() => handleButtonClick("Growth")}
          >
            Growth ($2,000)
          </Button>,
        )
      }

      return <div className="grid grid-cols-1 gap-2 mt-4">{options}</div>
    }

    if (q === 16) {
      let upgradeOption = ""

      if (state.userData.purchase === "Play" && state.userData.budget === "$1,000-$2,500") {
        upgradeOption = "Upgrade to Starter"
      } else if (state.userData.urgency === "Immediate (30 days)") {
        upgradeOption = "Upgrade to Growth"
      }

      return (
        <div className="grid grid-cols-2 gap-2 mt-4">
          <Button
            variant="outline"
            className="border-red-600 animate-wiggle hover:scale-110 transition-transform"
            onClick={() => handleButtonClick(upgradeOption)}
          >
            {upgradeOption}
          </Button>
          <Button
            variant="outline"
            className="border-gray-400"
            onClick={() => handleButtonClick(`Keep ${state.userData.purchase}`)}
          >
            Keep {state.userData.purchase}
          </Button>
        </div>
      )
    }

    if (q === 17) {
      return (
        <div className="grid grid-cols-3 gap-2 mt-4">
          <Button
            variant="outline"
            className="border-red-600 hover:scale-110 transition-transform"
            onClick={() => handleButtonClick("1 Month ($300)")}
          >
            1 Month ($300)
          </Button>
          <Button
            variant="outline"
            className="border-red-600 hover:scale-110 transition-transform"
            onClick={() => handleButtonClick("3 Months ($750)")}
          >
            3 Months ($750)
          </Button>
          <Button
            variant="outline"
            className="border-red-600 hover:scale-110 transition-transform"
            onClick={() => handleButtonClick("No")}
          >
            No
          </Button>
        </div>
      )
    }

    // Text input questions
    if (q === 1 || q === 3) {
      return (
        <form onSubmit={handleSubmit} className="mt-4">
          <Input
            ref={inputRef}
            placeholder={q === 1 ? "E.g., John Doe" : "E.g., info@keffordconsulting.com"}
            className="border-red-600 focus:ring-red-600"
          />
          <Button type="submit" className="mt-2 bg-red-600 hover:bg-red-700 text-white">
            Submit
          </Button>
        </form>
      )
    }

    // Textarea questions
    return (
      <form onSubmit={handleSubmit} className="mt-4">
        <Textarea
          ref={textareaRef}
          placeholder={getPlaceholderForQuestion(q)}
          className="border-red-600 focus:ring-red-600"
          rows={4}
        />
        <Button type="submit" className="mt-2 bg-red-600 hover:bg-red-700 text-white">
          Submit
        </Button>
      </form>
    )
  }

  // Get placeholder text based on question number
  const getPlaceholderForQuestion = (q: number) => {
    switch (q) {
      case 2:
        return "E.g., Acme Plumbing, Boise, ID. Trades industry. I'm a plumber, fixing pipes and chasing leads daily."
      case 5:
        return "E.g., I need a new business idea to boost revenue, I can't grow without one, 5 employees."
      case 7:
        return "E.g., Losing clients due to slow sales, and my team's burned out."
      case 8:
        return "E.g., Tight budget and no online presence."
      case 9:
        return "E.g., Double revenue to $50K/month, track revenue growth. Settle for adding $10K."
      case 10:
        return "E.g., Top-notch service and loyal clients set us apart."
      case 11:
        return "E.g., Six months ago, a key client left."
      case 12:
        return "E.g., Lack of training, plus weak online presence."
      default:
        return ""
    }
  }

  return (
    <Card
      className={cn(
        "w-full max-w-3xl mx-auto bg-white border border-red-600 border-opacity-20",
        isFullScreen ? "h-screen" : "h-[600px]",
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
        <div className="flex items-center">
          <div className="text-red-600 font-bold text-2xl animate-pulse">K</div>
          <h2 className="ml-2 font-bold">
            {state.userData.client_first_name
              ? `${state.userData.client_first_name}'s Growth Journey`
              : "Your Growth Journey"}
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="text-gray-500" onClick={toggleSound}>
            {state.soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </Button>
          <Button variant="ghost" size="sm" className="text-red-600">
            Save for Later
          </Button>
          <Button variant="ghost" size="sm" className="text-red-600">
            Need help?
          </Button>
        </div>
      </CardHeader>

      {/* ROI Meters (visible after Q4) */}
      {state.currentQuestion > 4 && (
        <div className="flex justify-between px-4 py-2 bg-gray-50 text-sm">
          <div className="flex items-center">
            <span className="text-green-600 font-bold">${state.potentialSavings.toLocaleString()}</span>
            <span className="ml-1">Revenue Boost</span>
          </div>
          <div className="flex items-center">
            <span className="text-blue-600 font-bold">{state.timeSaved.toFixed(1)}</span>
            <span className="ml-1">Hours Saved</span>
          </div>
        </div>
      )}

      <CardContent className="p-4 overflow-y-auto" style={{ height: isFullScreen ? "calc(100vh - 200px)" : "380px" }}>
        <div className="space-y-4">
          {state.messages.map((message, index) => (
            <div key={index} className={cn("flex", message.type === "bot" ? "justify-start" : "justify-end")}>
              <div
                className={cn(
                  "max-w-[80%] rounded-lg px-4 py-2 text-sm",
                  message.type === "bot" ? "bg-red-200 text-gray-800" : "bg-white border border-red-600 text-gray-800",
                )}
              >
                {message.content}
              </div>
            </div>
          ))}

          {state.loading && (
            <div className="flex justify-start">
              <div className="bg-red-200 rounded-lg px-4 py-2 text-sm">
                <span className="inline-flex">
                  A.C.T. is typing
                  <span className="animate-pulse">.</span>
                  <span className="animate-pulse delay-100">.</span>
                  <span className="animate-pulse delay-200">.</span>
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </CardContent>

      <CardFooter className="border-t p-4 flex flex-col">
        {/* Progress bar */}
        <div className="w-full mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{state.progress}% Complete</span>
            <span>{progressMessages[state.currentQuestion - 1]}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-red-600 h-2 rounded-full transition-all duration-500 ease-in-out"
              style={{ width: `${state.progress}%` }}
            ></div>
          </div>
        </div>

        {/* Error message */}
        {state.error && <div className="text-red-600 text-sm mb-2">{state.error}</div>}

        {/* Input area */}
        <div className="w-full relative">
          {renderQuestionInput()}

          {/* Lightbulb tooltip */}
          <div className="absolute right-0 top-0 -mt-10">
            <Button
              variant="ghost"
              size="sm"
              className="text-yellow-400 hover:text-yellow-500"
              onClick={toggleLightbulb}
            >
              <LightbulbIcon size={20} />
            </Button>

            {state.showLightbulb && (
              <div className="absolute right-0 bottom-full mb-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg shadow-lg w-64 z-10">
                <p className="text-sm text-gray-700">{lightbulbTooltips[state.currentQuestion - 1]}</p>
              </div>
            )}
          </div>

          {/* Back button */}
          {state.backButtonEnabled && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-0 top-0 -mt-10 text-gray-500"
              onClick={handleBack}
            >
              <ArrowLeft size={16} className="mr-1" /> Back
            </Button>
          )}
        </div>
      </CardFooter>

      {/* Audio element for sound effects */}
      <audio ref={audioRef} />

      {/* Watermark */}
      <div className="absolute bottom-2 right-2 opacity-20 pointer-events-none">
        <svg width="30" height="30" viewBox="0 0 100 100">
          <path d="M10,50 Q50,10 90,50 T10,50" fill="none" stroke="#FF0000" strokeWidth="5" />
        </svg>
      </div>
    </Card>
  )
}
