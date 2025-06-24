"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  LightbulbIcon,
  ArrowLeft,
  Volume2,
  VolumeX,
  HelpCircle,
  XCircle,
  ExternalLink,
  UploadCloud,
  Download,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { saveUserData, logBotEvent, emailResumeLinkAction } from "@/app/actions" // Mock server actions

// Types
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
  isTyping: boolean
  sessionActive: boolean
  lastActivityTime: number
  invalidInputCount: number
  tosAccepted: boolean
  showKLogoAnimation: boolean
}

type UserData = {
  client_first_name: string
  client_last_name: string
  business_name: string
  location: string
  industry_type: string
  profession: string
  daily_tasks: string
  email: string // Q3_email
  purchase: string // Q4_purchase
  challenge: string // Q5_challenge
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
  q5_keywords: string[]
  q5_emotive_word: string
  referrer_name?: string
  purchase_date?: string
  tweak_used?: boolean
  tweak_timestamp?: string
  additional_tweak_notes?: string
}

type Message = {
  id: string
  type: "bot" | "user"
  content: string | React.ReactNode
  timestamp: number
}

const initialUserData: UserData = {
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
  q5_keywords: [],
  q5_emotive_word: "",
}

// Constants
const SESSION_TIMEOUT_MS = 10 * 60 * 1000 // 10 minutes
const NUDGE_TIME_MS = 8 * 60 * 1000 // 8 minutes
const MAX_INVALID_INPUTS = 3

interface ACTBotV3Props {
  initialQuestion?: number
  isFullScreen?: boolean
  referrer_name?: string
  initialUserData?: Partial<UserData>
  onComplete?: () => void
}

export function ACTBotV3({
  initialQuestion = 1,
  isFullScreen = false,
  referrer_name = "",
  initialUserData,
  onComplete,
}: ACTBotV3Props) {
  const [state, setState] = useState<BotState>({
    currentQuestion: initialQuestion,
    userData: { ...initialUserData, ...initialUserData, referrer_name } || { ...initialUserData, referrer_name },
    messages: [],
    loading: false,
    error: null,
    progress: 0,
    potentialSavings: 0,
    timeSaved: 0,
    showLightbulb: false,
    soundEnabled: true,
    backButtonEnabled: false,
    isTyping: false,
    sessionActive: true,
    lastActivityTime: Date.now(),
    invalidInputCount: 0,
    tosAccepted: false,
    showKLogoAnimation: initialQuestion === 1,
  })

  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null)
  const nudgeTimerRef = useRef<NodeJS.Timeout | null>(null)

  const sounds = {
    whistle: "/sounds/whistle.mp3",
    chaChing: "/sounds/cha-ching.mp3",
    stopwatch: "/sounds/stopwatch.mp3",
    cheering: "/sounds/cheering.mp3",
  }

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
    "Your solution awaits..",
    "Boost your plan...",
    "Secure your success...",
    "You're all set!",
  ]

  const lightbulbTooltips: {
    [key: number]: (profession?: string, outcome?: string, savings?: number, purchase?: string) => string
  } = {
    1: () => "Share your full name to start your journey—e.g., 'John Doe.' This helps us personalize your experience!",
    2: () =>
      "Include your business name, city, industry, and a key daily task—e.g., 'Acme Plumbing, Boise, Trades. I'm a plumber, focusing on pipe repairs and client follow-ups.' This helps us personalize your growth plan!",
    3: () =>
      "Use your business email to unlock exclusive tools—e.g., 'info@acmeplumbing.com.' This ensures secure access to your personalized plan!",
    4: (profession) =>
      `Choose a plan that fits your goals—e.g., Play for quick wins, Premium for full support with 3 months of calls. Most ${profession || "professionals"} pick Growth for lasting results!`,
    5: () =>
      "Pick a challenge and explain its urgency—e.g., 'Sales: We're losing $5K/month due to low leads, and I have 3 employees counting on growth.' Be specific to ensure the best recommendations!",
    6: () =>
      "Consider your business's current state—e.g., 'Growing Fast: We're gaining clients but can't keep up with demand.' This helps us tailor your recommendations!",
    7: () =>
      "Focus on the biggest hurdle and a secondary concern—e.g., 'Slow sales: We're losing $2K/month, and my team's burnout is reducing productivity.' Be specific to help us address your needs!",
    8: (profession) =>
      `Highlight your top skill and a key constraint. E.g., for ${profession === "Plumber" ? "plumbers" : profession === "Accountant" ? "accountants" : "professionals"}: '${profession === "Plumber" ? "We're known for expert pipe repairs with a 98% customer satisfaction rate, but lack a website to attract new clients." : profession === "Accountant" ? "We deliver precise audits with zero errors, but struggle with a small marketing budget to reach new businesses." : "Our team is highly skilled, but we operate with a lean budget."}'`,
    9: () =>
      "Define your ideal goal, key metric, and minimum target—e.g., 'Double revenue to $50K/month, track revenue growth, settle for adding $10K.' This helps us set clear objectives for your plan!",
    10: (profession, outcome, savings, industry_type) =>
      `Highlight strengths that address your challenge—e.g., 'We have a loyal client base with 90% retention, and our ${industry_type || "industry"} expertise ensures quick solutions.' This helps us tailor your strategy!`,
    11: () =>
      "Think about a specific event that triggered this challenge—e.g., 'Six months ago, a key client left due to pricing issues, impacting our revenue.' Focus on the timing and root cause to help us tailor your solution!",
    12: () =>
      "Identify the main cause and a secondary factor—e.g., 'Lack of training: Staff can't handle new clients, plus our weak online presence limits visibility.' This ensures we address the root issues!",
    13: () =>
      "Specify your budget to ensure tailored recommendations—e.g., '$1,000 one-time' or 'Flexible: I'm open to investing for the right solution.' This helps us personalize the recommendations!",
    14: () =>
      "Specify the urgency to prioritize your plan—e.g., 'Immediate: Losing clients in 30 days, costing $3K/month.' This ensures we act fast where needed and provide more gradual growth if time allows!",
    15: (profession, outcome) =>
      `Upgrade for faster results—e.g., Premium offers a Consult plus 3 months of support to achieve ${outcome || "your goals"}. 80% of ${profession || "professionals"} see 30%+ growth with Growth or Premium!`,
    16: (profession, outcome, savings) =>
      `Upgrade to accelerate your challenge solution—e.g., Growth offers 3 months of support to drive ${savings ? `$${savings.toLocaleString()}` : "significant savings"}. 80% of users upgrade for faster results!`,
    17: () => "88% of customers add Support Calls to protect their investment and ensure successful results.",
    18: (profession, outcome, savings, purchase) =>
      `Confirm your purchase to start growing—your ${purchase || "plan"} is ready to deliver ${savings ? `$${savings.toLocaleString()}` : "significant"} in savings!`,
  }

  const playSound = useCallback(
    (soundUrl: string) => {
      if (state.soundEnabled && audioRef.current) {
        const currentAudioElement = audioRef.current

        // Clone the node to ensure a fresh element for playback
        // This helps in reseting the audio element's state and event listeners
        const newAudioElement = currentAudioElement.cloneNode(true) as HTMLAudioElement

        // Replace the old audio element with the new one in the DOM
        if (currentAudioElement.parentNode) {
          currentAudioElement.parentNode.replaceChild(newAudioElement, currentAudioElement)
        }

        // Update the ref to point to the new element that is now in the DOM
        audioRef.current = newAudioElement

        const handleCanPlay = () => {
          newAudioElement.play().catch((e) => {
            console.error(`Error playing sound (${soundUrl}):`, e)
          })
          // Clean up listeners after use
          newAudioElement.removeEventListener("canplaythrough", handleCanPlay)
          newAudioElement.removeEventListener("error", handleError)
        }

        const handleError = (e: Event) => {
          let errorMessage = `Error loading audio source ${soundUrl}.`
          if (newAudioElement.error) {
            switch (newAudioElement.error.code) {
              case MediaError.MEDIA_ERR_ABORTED:
                errorMessage += " Fetch aborted by user."
                break
              case MediaError.MEDIA_ERR_NETWORK:
                errorMessage += " Network error."
                break
              case MediaError.MEDIA_ERR_DECODE:
                errorMessage += " Decoding error."
                break
              case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                errorMessage += " Source format not supported or file is invalid/empty."
                break
              default:
                errorMessage += ` Unknown error code: ${newAudioElement.error.code}.`
            }
          } else {
            errorMessage += " Unknown error occurred."
          }
          console.error(errorMessage, e) // Log the detailed error
          // Clean up listeners
          newAudioElement.removeEventListener("canplaythrough", handleCanPlay)
          newAudioElement.removeEventListener("error", handleError)
        }

        // Add event listeners to the new audio element
        newAudioElement.addEventListener("canplaythrough", handleCanPlay)
        newAudioElement.addEventListener("error", handleError)

        // Set the source and initiate loading
        // It's generally safer to set src *before* calling load.
        if (newAudioElement.src !== new URL(soundUrl, window.location.origin).href) {
          newAudioElement.src = soundUrl
        }
        newAudioElement.load() // Explicitly call load to fetch the media.
      }
    },
    [state.soundEnabled],
  )

  const addMessage = useCallback((type: "bot" | "user", content: string | React.ReactNode) => {
    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, { id: Date.now().toString(), type, content, timestamp: Date.now() }],
      lastActivityTime: Date.now(),
    }))
  }, [])

  const resetInactivityTimers = useCallback(() => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current)
    if (nudgeTimerRef.current) clearTimeout(nudgeTimerRef.current)

    nudgeTimerRef.current = setTimeout(() => {
      if (state.sessionActive) {
        addMessage("bot", `Still here, ${state.userData.client_first_name || "friend"}? Let's explore your query!`)
        logBotEvent({
          eventName: "InactivityNudgeSent",
          userId: state.userData.email,
          details: { currentQuestion: state.currentQuestion },
        })
      }
    }, NUDGE_TIME_MS)

    inactivityTimerRef.current = setTimeout(() => {
      if (state.sessionActive) {
        addMessage("bot", "Your session timed out—let's start fresh!")
        logBotEvent({
          eventName: "SessionTimeout",
          userId: state.userData.email,
          details: { currentQuestion: state.currentQuestion },
        })
        setState((prev) => ({
          ...prev,
          currentQuestion: 1,
          userData: { ...initialUserData, referrer_name: prev.userData.referrer_name },
          messages: [],
          progress: 0,
          potentialSavings: 0,
          timeSaved: 0,
          sessionActive: false,
          showKLogoAnimation: true,
        }))
      }
    }, SESSION_TIMEOUT_MS)
  }, [
    state.sessionActive,
    state.currentQuestion,
    state.userData.client_first_name,
    state.userData.email,
    state.userData.referrer_name,
    addMessage,
  ])

  useEffect(() => {
    if (state.showKLogoAnimation) {
      const timer = setTimeout(() => setState((prev) => ({ ...prev, showKLogoAnimation: false })), 1000)
      return () => clearTimeout(timer)
    }
  }, [state.showKLogoAnimation])

  useEffect(() => {
    if (!state.showKLogoAnimation && state.messages.length === 0 && state.currentQuestion === 1) {
      const firstQuestionText = state.userData.referrer_name
        ? `Hi, I'm A.C.T.! Your friend ${state.userData.referrer_name} invited you—let's spark 20-30%+ growth for your business! What's your name?`
        : "Hi, I'm A.C.T., your Automated Consultant Toolkit. We're here to spark 20-30%+ growth for your business! Let's start with an easy one, what's your name?"

      addMessage("bot", firstQuestionText)
      playSound(sounds.whistle)
      setState((prev) => ({ ...prev, progress: 5 }))
    } else if (!state.showKLogoAnimation && state.messages.length === 0 && state.currentQuestion >= 4) {
      // Continue from where we left off in Members Area
      const continueText = `Welcome back, ${state.userData.client_first_name || "friend"}! Let's continue where we left off. Now, let's choose your path forward.`
      addMessage("bot", continueText)
      setState((prev) => ({ ...prev, progress: Math.max(20, state.currentQuestion * 5) }))
    }
  }, [
    state.currentQuestion,
    state.userData.referrer_name,
    state.userData.client_first_name,
    state.messages.length,
    addMessage,
    playSound,
    sounds.whistle,
    state.showKLogoAnimation,
  ])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [state.messages])

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus()
    else if (textareaRef.current) textareaRef.current.focus()
  }, [state.currentQuestion, state.loading])

  useEffect(() => {
    resetInactivityTimers()
    return () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current)
      if (nudgeTimerRef.current) clearTimeout(nudgeTimerRef.current)
    }
  }, [state.lastActivityTime, resetInactivityTimers])

  const mockNLP = (text: string): { keywords: string[]; emotiveWord: string } => {
    const words = text.toLowerCase().split(/\s+/)
    const commonKeywords = ["sales", "clients", "revenue", "idea", "marketing", "leads", "efficiency", "team"]
    const emotiveWords = ["cratering", "struggling", "frustration", "losing", "urgent"]
    const keywords = words.filter((word) => commonKeywords.includes(word.replace(/[.,!?]/g, ""))).slice(0, 2)
    const emotiveWord = words.find((word) => emotiveWords.includes(word.replace(/[.,!?]/g, ""))) || ""
    return { keywords, emotiveWord }
  }

  const handleSubmit = async (e?: React.FormEvent, buttonValue?: string) => {
    if (e) e.preventDefault()
    resetInactivityTimers()
    const inputValue =
      buttonValue !== undefined ? buttonValue : inputRef.current?.value || textareaRef.current?.value || ""
    if (!inputValue.trim() && ![4, 6, 13, 14, 15, 16, 17, 18].includes(state.currentQuestion)) {
      setState((prev) => ({ ...prev, error: "Please provide an answer." }))
      return
    }
    if (state.currentQuestion === 3 && inputValue.toLowerCase() === "yes" && !state.tosAccepted) {
      return
    }
    addMessage("user", inputValue)
    setState((prev) => ({ ...prev, loading: true, isTyping: true, error: null }))
    try {
      await processAnswer(inputValue)
      setState((prev) => ({ ...prev, invalidInputCount: 0 }))
    } catch (error: any) {
      console.error("Error processing answer:", error)
      setState((prev) => ({
        ...prev,
        loading: false,
        isTyping: false,
        error: error.message || "An error occurred. Please try again.",
        invalidInputCount: prev.invalidInputCount + 1,
      }))
      if (state.invalidInputCount + 1 >= MAX_INVALID_INPUTS) {
        addMessage("bot", "Too many invalid inputs—please try again later or contact support@keffordconsulting.com.")
        setState((prev) => ({ ...prev, sessionActive: false }))
        logBotEvent({
          eventName: "TooManyInvalidInputsLockout",
          userId: state.userData.email,
          details: { currentQuestion: state.currentQuestion },
        })
      }
    }
  }

  const processAnswer = async (answer: string) => {
    if (inputRef.current) inputRef.current.value = ""
    if (textareaRef.current) textareaRef.current.value = ""

    let nextQuestion = state.currentQuestion + 1
    const updatedUserData = { ...state.userData }
    let botResponse: string | React.ReactNode = ""
    let updatedPotentialSavings = state.potentialSavings
    let updatedTimeSaved = state.timeSaved
    let soundToPlay = ""
    let newProgress = state.progress

    await new Promise((resolve) => setTimeout(resolve, 1000))

    switch (state.currentQuestion) {
      case 1:
        const nameParts = answer.trim().split(" ")
        updatedUserData.client_first_name = nameParts[0]
          ? nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1)
          : ""
        updatedUserData.client_last_name = nameParts.length > 1 ? nameParts.slice(1).join(" ") : ""
        botResponse = `Great to meet you, ${updatedUserData.client_first_name}! I'm excited to help you succeed.`
        newProgress = 5
        if (answer.toUpperCase() === "ACTFAST") {
          updatedUserData.purchase = "Test Playbook"
          updatedUserData.final_purchase = "Test Playbook"
          updatedPotentialSavings = 0
          nextQuestion = 18
          newProgress = 90
        }
        await saveUserData({
          userId: updatedUserData.email || `guest_${Date.now()}`,
          data: {
            client_first_name: updatedUserData.client_first_name,
            client_last_name: updatedUserData.client_last_name,
          },
        })
        break
      case 2:
        updatedUserData.business_name = answer.match(/business: ([^,]+)/i)?.[1]?.trim() || "N/A"
        updatedUserData.location = answer.match(/location: ([^,]+)/i)?.[1]?.trim() || "N/A"
        updatedUserData.industry_type = answer.match(/industry: ([^,]+)/i)?.[1]?.trim() || "N/A"
        updatedUserData.profession = answer.match(/role: ([^.]+)/i)?.[1]?.trim() || "N/A"
        updatedUserData.daily_tasks = answer.match(/tasks: (.+)/i)?.[1]?.trim() || "N/A"
        const businessInfo = answer.split(/,|\./)
        if (!updatedUserData.business_name || updatedUserData.business_name === "N/A")
          updatedUserData.business_name = businessInfo[0]?.trim()
        if (!updatedUserData.location || updatedUserData.location === "N/A")
          updatedUserData.location = businessInfo[1]?.trim()
        if (!updatedUserData.industry_type || updatedUserData.industry_type === "N/A") {
          const industryMatch = answer.match(/(\w+)\s+industry/i)
          if (industryMatch) updatedUserData.industry_type = industryMatch[1].trim()
        }
        const roleMatch = answer.match(/I'm a ([^,.]+)/i)
        if (roleMatch && (!updatedUserData.profession || updatedUserData.profession === "N/A"))
          updatedUserData.profession = roleMatch[1].trim()
        if (!updatedUserData.daily_tasks || updatedUserData.daily_tasks === "N/A") updatedUserData.daily_tasks = answer
        if (answer.length < 50 && typeof buttonValue === "undefined") {
          setState((prev) => ({
            ...prev,
            error: "Please share your business, location, industry, and role (min 50 characters).",
            loading: false,
            isTyping: false,
          }))
          return
        }
        botResponse = `Thanks, ${updatedUserData.client_first_name}! What a vibrant business. I'm excited to learn more about your needs.`
        newProgress = 10
        await saveUserData({
          userId: updatedUserData.email || updatedUserData.client_first_name,
          data: {
            business_name: updatedUserData.business_name,
            location: updatedUserData.location,
            industry_type: updatedUserData.industry_type,
            profession: updatedUserData.profession,
            daily_tasks: updatedUserData.daily_tasks,
          },
        })
        break
      case 3:
        if (answer.toLowerCase() === "yes") {
          if (!state.tosAccepted) {
            setState((prev) => ({
              ...prev,
              error: "Please accept the Terms of Service and NDA first.",
              loading: false,
              isTyping: false,
            }))
            return
          }
          botResponse = `Please enter your business email to register:`
          newProgress = 15
        } else if (answer.toLowerCase() === "no") {
          botResponse =
            "No problem. Feel free to browse our site. You can resume this chat anytime. Session saved (mocked)."
          window.open("/faq", "_blank")
          nextQuestion = state.currentQuestion
          setState((prev) => ({ ...prev, sessionActive: false }))
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(answer)) {
            setState((prev) => ({ ...prev, error: "Please enter a valid email.", loading: false, isTyping: false }))
            return
          }
          updatedUserData.email = answer
          botResponse = `Awesome, ${updatedUserData.client_first_name}! Preparing your account in our Members Only Area. You'll be redirected shortly.`
          newProgress = 15
          await saveUserData({ userId: updatedUserData.email, data: { email: updatedUserData.email } })

          // Store user data in localStorage before redirect
          localStorage.setItem("actBotUserData", JSON.stringify(updatedUserData))

          setTimeout(() => router.push("/members?startBotAt=4"), 2000)
        }
        break
      case 4:
        updatedUserData.purchase = answer
        newProgress = 20
        if (answer === "FAQ") {
          botResponse = "Heading to our FAQ page! Your session is saved (mocked)."
          window.open("/faq", "_blank")
          nextQuestion = state.currentQuestion
        } else {
          botResponse = `Brilliant choice, ${updatedUserData.client_first_name}! Let's take care of your needs...`
          if (answer === "Growth" || answer === "Premium") {
            nextQuestion = 15
            newProgress = 75
          }
        }
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
        if (updatedPotentialSavings === 0 && updatedTimeSaved > 0) soundToPlay = sounds.stopwatch
        await saveUserData({ userId: updatedUserData.email, data: { purchase_q4: updatedUserData.purchase } })
        break
      case 5:
        updatedUserData.challenge = answer
        const additionalInfo = textareaRef.current?.value || ""
        if (additionalInfo.length < 50) {
          setState((prev) => ({
            ...prev,
            error: "Please add more detail (min 50 characters).",
            loading: false,
            isTyping: false,
          }))
          return
        }
        const employeeMatch = additionalInfo.match(/(\d+)\s*employees?/i)
        if (employeeMatch) updatedUserData.business_size = employeeMatch[1]
        const { keywords, emotiveWord } = mockNLP(additionalInfo)
        updatedUserData.q5_keywords = keywords
        updatedUserData.q5_emotive_word = emotiveWord
        botResponse = `${updatedUserData.challenge}? We've got oodles of solutions surrounding that one, ${updatedUserData.client_first_name}. Let's dive deeper...`
        newProgress = 25
        if (["Sales", "Hiring"].includes(answer)) updatedTimeSaved += 5
        else if (["Branding", "Digital Growth"].includes(answer)) updatedTimeSaved += 4
        else if (["Partnerships", "Cost Reduction"].includes(answer)) updatedTimeSaved += 3
        else if (["Innovation", "Other", "Efficiency", "Client Retention", "Lead Generation"].includes(answer))
          updatedTimeSaved += 2
        if (answer === "Sales") updatedPotentialSavings += 3000
        if (updatedPotentialSavings > 0) soundToPlay = sounds.chaChing
        else if (updatedTimeSaved > 0) soundToPlay = sounds.stopwatch
        await saveUserData({
          userId: updatedUserData.email,
          data: {
            q5_challenge: updatedUserData.challenge,
            business_size: updatedUserData.business_size,
            q5_keywords: keywords,
            q5_emotive_word: emotiveWord,
            q5_details: additionalInfo,
          },
        })
        break
      case 6:
        updatedUserData.business_stage = answer
        botResponse = `Got it, ${updatedUserData.client_first_name}. We're shaping your plan...`
        newProgress = 30
        if (answer === "Growing Fast") {
          updatedPotentialSavings += 2000
          updatedTimeSaved += 2
        } else if (answer === "Stable") {
          updatedPotentialSavings += 1500
          updatedTimeSaved += 1.5
        } else if (answer === "Struggling") {
          updatedPotentialSavings += 1000
          updatedTimeSaved += 1
        }
        if (updatedPotentialSavings > 0 && state.potentialSavings !== updatedPotentialSavings)
          soundToPlay = sounds.chaChing
        else if (updatedTimeSaved > 0 && state.timeSaved !== updatedTimeSaved) soundToPlay = sounds.stopwatch
        await saveUserData({ userId: updatedUserData.email, data: { business_stage: updatedUserData.business_stage } })
        break
      case 7:
        const issues = answer.split(/and|,/i)
        updatedUserData.primary_issue = issues[0]?.trim()
        updatedUserData.secondary_issue = issues.length > 1 ? issues.slice(1).join(" ").trim() : ""
        if (mockNLP(answer).keywords.includes("clients")) {
          updatedPotentialSavings += 200
          updatedTimeSaved += 0.5
        }
        botResponse = `That's tough, ${updatedUserData.client_first_name}. Thanks for sharing the details. We're going to help...`
        newProgress = 35
        if (updatedPotentialSavings > 0 && state.potentialSavings !== updatedPotentialSavings)
          soundToPlay = sounds.chaChing
        else if (updatedTimeSaved > 0 && state.timeSaved !== updatedTimeSaved) soundToPlay = sounds.stopwatch
        await saveUserData({
          userId: updatedUserData.email,
          data: { primary_issue: updatedUserData.primary_issue, secondary_issue: updatedUserData.secondary_issue },
        })
        break
      case 8:
        updatedUserData.limits = answer
        if (mockNLP(answer).keywords.includes("budget")) {
          updatedPotentialSavings += 100
          updatedTimeSaved += 0.3
        }
        botResponse = `I hear you, ${updatedUserData.client_first_name}. We'll keep this in mind and work with what we've got...`
        newProgress = 40
        if (updatedPotentialSavings > 0 && state.potentialSavings !== updatedPotentialSavings)
          soundToPlay = sounds.chaChing
        else if (updatedTimeSaved > 0 && state.timeSaved !== updatedTimeSaved) soundToPlay = sounds.stopwatch
        await saveUserData({ userId: updatedUserData.email, data: { limits: updatedUserData.limits } })
        break
      case 9:
        const outcomes = answer.split(/,|\./)
        updatedUserData.dream_outcome = outcomes[0]?.trim()
        updatedUserData.success_metric = outcomes[1]?.trim()
        updatedUserData.settle_outcome = outcomes[2]?.trim()
        if (mockNLP(answer).keywords.includes("sales")) {
          updatedPotentialSavings += 300
          updatedTimeSaved += 0.5
        }
        botResponse = `Inspiring, ${updatedUserData.client_first_name}! We're thrilled to make it happen...`
        newProgress = 45
        if (updatedPotentialSavings > 0 && state.potentialSavings !== updatedPotentialSavings)
          soundToPlay = sounds.chaChing
        else if (updatedTimeSaved > 0 && state.timeSaved !== updatedTimeSaved) soundToPlay = sounds.stopwatch
        await saveUserData({
          userId: updatedUserData.email,
          data: {
            dream_outcome: updatedUserData.dream_outcome,
            success_metric: updatedUserData.success_metric,
            settle_outcome: updatedUserData.settle_outcome,
          },
        })
        break
      case 10:
        updatedUserData.strengths = answer
        if (mockNLP(answer).keywords.includes("service")) {
          updatedPotentialSavings += 200
          updatedTimeSaved += 0.5
        }
        botResponse = `That's a solid foundation, ${updatedUserData.client_first_name}! Let's build on it...`
        newProgress = 50
        if (updatedPotentialSavings > 0 && state.potentialSavings !== updatedPotentialSavings)
          soundToPlay = sounds.chaChing
        else if (updatedTimeSaved > 0 && state.timeSaved !== updatedTimeSaved) soundToPlay = sounds.stopwatch
        await saveUserData({ userId: updatedUserData.email, data: { strengths: updatedUserData.strengths } })
        break
      case 11:
        updatedUserData.challenge_start = answer
        if (mockNLP(answer).keywords.includes("client")) {
          updatedPotentialSavings += 200
          updatedTimeSaved += 0.5
        }
        botResponse = `Thanks for that. Sorry to hear, ${updatedUserData.client_first_name}. On the bright side, we've now got a clearer understanding of the problems, and are over halfway to your solutions...`
        newProgress = 55
        if (updatedPotentialSavings > 0 && state.potentialSavings !== updatedPotentialSavings)
          soundToPlay = sounds.chaChing
        else if (updatedTimeSaved > 0 && state.timeSaved !== updatedTimeSaved) soundToPlay = sounds.stopwatch
        await saveUserData({
          userId: updatedUserData.email,
          data: { challenge_start: updatedUserData.challenge_start },
        })
        break
      case 12:
        updatedUserData.root_cause = answer
        if (mockNLP(answer).keywords.includes("training")) {
          updatedPotentialSavings += 200
          updatedTimeSaved += 0.5
        }
        botResponse = `Tough but not insurmountable. You're doing a great job helping me focus on the details, ${updatedUserData.client_first_name}. Let's keep going...`
        newProgress = 60
        if (updatedPotentialSavings > 0 && state.potentialSavings !== updatedPotentialSavings)
          soundToPlay = sounds.chaChing
        else if (updatedTimeSaved > 0 && state.timeSaved !== updatedTimeSaved) soundToPlay = sounds.stopwatch
        await saveUserData({ userId: updatedUserData.email, data: { root_cause: updatedUserData.root_cause } })
        break
      case 13:
        updatedUserData.budget = answer
        if (mockNLP(answer).keywords.includes("flexible")) {
          updatedPotentialSavings += 300
          updatedTimeSaved += 0.5
        }
        botResponse = `Perfect, ${updatedUserData.client_first_name}. We're almost there...`
        newProgress = 65
        soundToPlay = sounds.chaChing
        await saveUserData({ userId: updatedUserData.email, data: { budget: updatedUserData.budget } })
        break
      case 14:
        updatedUserData.urgency = answer
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
        botResponse = `That's it! The hard part's done, ${updatedUserData.client_first_name}. Let's get to your solution...`
        newProgress = 70
        soundToPlay = sounds.stopwatch
        await saveUserData({ userId: updatedUserData.email, data: { urgency: updatedUserData.urgency } })
        break
      case 15:
        updatedUserData.final_purchase = answer
        if (answer === "Premium") {
          updatedPotentialSavings += 3000
          updatedTimeSaved += 3
          nextQuestion = 18
          newProgress = 90
        } else if (answer === "Growth") {
          updatedPotentialSavings += 2000
          updatedTimeSaved += 2
          newProgress = 75
        }
        botResponse = `Here's how we'll win, ${updatedUserData.client_first_name}...`
        soundToPlay = sounds.chaChing
        await saveUserData({
          userId: updatedUserData.email,
          data: { final_purchase_q15: updatedUserData.final_purchase },
        })
        break
      case 16:
        if (answer.startsWith("Upgrade to")) {
          const newPurchase = answer.replace("Upgrade to ", "")
          updatedUserData.final_purchase = newPurchase
          if (newPurchase === "Starter") {
            updatedPotentialSavings += 1000
            updatedTimeSaved += 1
          } else if (newPurchase === "Growth") {
            updatedPotentialSavings += 2000
            updatedTimeSaved += 2
          }
          soundToPlay = sounds.chaChing
        } else {
          updatedUserData.final_purchase = updatedUserData.purchase
        }
        botResponse = `Smart move, ${updatedUserData.client_first_name}! Last question...`
        newProgress = 80
        await saveUserData({
          userId: updatedUserData.email,
          data: { final_purchase_q16: updatedUserData.final_purchase },
        })
        break
      case 17:
        updatedUserData.support_calls = answer
        if (answer === "1 Month ($300)" || answer === "3 Months ($750)") {
          updatedPotentialSavings += 600
          updatedTimeSaved += 1
        }
        botResponse = `You're set for success, ${updatedUserData.client_first_name}!`
        newProgress = 85
        await saveUserData({ userId: updatedUserData.email, data: { support_calls: updatedUserData.support_calls } })
        break
      case 18:
        updatedUserData.purchase_date = new Date().toISOString().split("T")[0]
        const finalPurchase = updatedUserData.final_purchase || updatedUserData.purchase
        addMessage("bot", `Redirecting to payment for ${finalPurchase}... (Mocked)`)
        await new Promise((resolve) => setTimeout(resolve, 1500))
        botResponse = (
          <div>
            <p>How good was that?! You've got this, {updatedUserData.client_first_name}!</p>
            <p>
              Congratulations, your {finalPurchase} delivers ${updatedPotentialSavings.toLocaleString()} in savings and{" "}
              {updatedTimeSaved.toFixed(1)} hours saved in research/planning for your business growth.
            </p>
            <p className="mt-4">Your {finalPurchase} is ready—check your email for download links and next steps!</p>
            <div className="mt-6 p-4 border border-dashed border-red-500 rounded-md bg-red-50">
              <h4 className="font-semibold text-md text-red-700 mb-2">Next Steps & Special Offers:</h4>
              <p className="text-sm mb-2">
                Join our Referral Program! Invite 5 friends to earn $100-$500 cashback and help them grow!
              </p>
              <div className="flex gap-2 mb-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => alert(`Referral Code: ${updatedUserData.client_first_name.toUpperCase()}2025`)}
                >
                  Invite Now
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    window.open(
                      `https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fwww.keffordconsulting.com&quote=Grow%20your%20business%20with%20Kefford%20Consulting!%20Use%20my%20code%3A%20${updatedUserData.client_first_name.toUpperCase()}2025%20%23KeffordConsulting`,
                      "_blank",
                    )
                  }
                >
                  <ExternalLink size={14} className="mr-1" /> Share on Facebook
                </Button>
              </div>
              <p className="text-sm mb-2">
                Loved the process? Share your time/cost savings! Earn $25 credit for each review (max $150).
              </p>
              <div className="flex gap-2 flex-wrap">
                {["LinkedIn", "Google Reviews", "Facebook", "Instagram", "Yelp", "Nextdoor"].map((platform) => (
                  <Button
                    key={platform}
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      alert(
                        `Review on ${platform} (mock). Pre-filled: Kefford Consulting's ${finalPurchase} saved me time and delivered instant results! #KeffordConsulting. FTC: This is a incentivized review.`,
                      )
                    }
                  >
                    <ExternalLink size={14} className="mr-1" /> Share on {platform}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )
        newProgress = 100
        soundToPlay = sounds.cheering
        logBotEvent({
          eventName: "PurchaseConfirmed",
          userId: updatedUserData.email,
          details: { purchase: finalPurchase, savings: updatedPotentialSavings, timeSaved: updatedTimeSaved },
        })
        logBotEvent({
          eventName: "EmailSent_PostPurchaseThankYou",
          userId: updatedUserData.email,
          details: { purchase: finalPurchase },
        })
        logBotEvent({ eventName: "EmailSent_ReviewNudge1", userId: updatedUserData.email, details: {} })
        setState((prev) => ({ ...prev, backButtonEnabled: false }))

        // Call onComplete callback if provided (for Members Area)
        if (onComplete) {
          setTimeout(() => onComplete(), 3000) // Give time to see the completion message
        }
        break
      default:
        botResponse = "I'm not sure how to handle that. Let's try something else."
        nextQuestion = state.currentQuestion
        break
    }

    setState((prev) => ({
      ...prev,
      currentQuestion: nextQuestion,
      userData: updatedUserData,
      messages: botResponse
        ? [...prev.messages, { id: Date.now().toString(), type: "bot", content: botResponse, timestamp: Date.now() }]
        : prev.messages,
      loading: false,
      isTyping: false,
      progress: newProgress,
      potentialSavings: updatedPotentialSavings,
      timeSaved: updatedTimeSaved,
      backButtonEnabled: nextQuestion > 1 && nextQuestion < 18 && nextQuestion >= 5 && nextQuestion <= 17,
    }))

    if (soundToPlay) playSound(soundToPlay)
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  const handleButtonClick = (value: string) => {
    handleSubmit(undefined, value)
  }

  const handleBack = () => {
    resetInactivityTimers()
    if (state.currentQuestion > 1 && state.backButtonEnabled) {
      const prevQuestion = state.currentQuestion - 1
      setState((prev) => ({
        ...prev,
        currentQuestion: prevQuestion,
        messages: prev.messages.slice(0, prev.messages.length - 2),
        error: null,
        progress: Math.max(0, prev.progress - 5),
        backButtonEnabled: prevQuestion > 1 && prevQuestion < 18 && prevQuestion >= 5 && prevQuestion <= 17,
      }))
      logBotEvent({
        eventName: "BackButtonUsed",
        userId: state.userData.email,
        details: { from: state.currentQuestion, to: prevQuestion },
      })
    }
  }

  const toggleSound = () => setState((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))
  const toggleLightbulb = () => setState((prev) => ({ ...prev, showLightbulb: !prev.showLightbulb }))

  const getLightbulbTooltipContent = () => {
    const tooltipFn = lightbulbTooltips[state.currentQuestion]
    return tooltipFn
      ? tooltipFn(
          state.userData.profession,
          state.userData.dream_outcome,
          state.potentialSavings,
          state.userData.purchase,
        )
      : "Helpful tip!"
  }

  const handleSaveForLater = async () => {
    if (state.userData.email) {
      try {
        await emailResumeLinkAction({
          email: state.userData.email,
          currentQuestion: state.currentQuestion,
          userData: state.userData,
        })
        addMessage("bot", `A link to resume this session has been emailed to ${state.userData.email}. (Mocked)`)
        logBotEvent({
          eventName: "SaveForLaterUsed",
          userId: state.userData.email,
          details: { currentQuestion: state.currentQuestion },
        })
      } catch (err) {
        addMessage("bot", "Could not send resume link. Please try again.")
      }
    } else {
      addMessage("bot", "Please provide your email (in Question 3) to save your progress.")
    }
  }

  const handleHelp = () => {
    addMessage("bot", "What's on your mind?")
    logBotEvent({
      eventName: "HelpButtonClicked",
      userId: state.userData.email,
      details: { currentQuestion: state.currentQuestion },
    })
  }

  const renderQuestionInput = () => {
    const q = state.currentQuestion
    if (state.loading && q !== 18) return null
    if (state.showKLogoAnimation) return null
    const commonButtonClass = "border-red-600 text-red-600 hover:bg-red-50 font-arial text-sm"
    const wigglyButtonClass = "animate-wiggle hover:scale-110 transition-transform"
    const staticButtonClass = "border-gray-400 text-gray-700 hover:bg-gray-100 glow-subtle-gray"

    if (q === 18) {
      return (
        <Button
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-md text-base animate-pulse font-arial"
          onClick={() => handleButtonClick("Confirm Purchase")}
        >
          Confirm Purchase
        </Button>
      )
    }
    if (q === 3) {
      if (
        !state.tosAccepted &&
        state.messages.some(
          (m) => m.type === "bot" && typeof m.content === "string" && m.content.includes("Register now to unlock"),
        )
      ) {
        return (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className={cn(commonButtonClass, wigglyButtonClass)}>Yes</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Terms of Service & NDA</AlertDialogTitle>
                  <AlertDialogDescription>
                    Please review and accept our Terms of Service and Non-Disclosure Agreement to proceed.
                    <div className="mt-2 space-y-1">
                      <a
                        href="/documents/tos.pdf"
                        target="_blank"
                        className="text-red-600 hover:underline text-sm flex items-center"
                        rel="noreferrer"
                      >
                        <Download size={14} className="mr-1" /> View Terms of Service (PDF)
                      </a>
                      <a
                        href="/documents/nda.pdf"
                        target="_blank"
                        className="text-red-600 hover:underline text-sm flex items-center"
                        rel="noreferrer"
                      >
                        <Download size={14} className="mr-1" /> View NDA (PDF)
                      </a>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      setState((prev) => ({ ...prev, tosAccepted: true }))
                      handleSubmit(undefined, "yes")
                    }}
                  >
                    Accept & Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button className={cn(commonButtonClass)} onClick={() => handleButtonClick("No")}>
              No
            </Button>
          </div>
        )
      } else if (
        state.tosAccepted &&
        state.messages.some(
          (m) =>
            m.type === "bot" && typeof m.content === "string" && m.content.includes("Please enter your business email"),
        )
      ) {
        return (
          <form onSubmit={handleSubmit} className="mt-4 space-y-2">
            <Input
              ref={inputRef}
              type="email"
              placeholder="E.g., info@keffordconsulting.com"
              className="border-red-600 focus:ring-red-500 font-arial"
            />
            <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white w-full font-arial">
              Submit Email
            </Button>
          </form>
        )
      }
    }
    if (q === 4) {
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
          {["Play", "Playbook", "Starter", "Growth", "Premium", "FAQ"].map((opt) => (
            <Button
              key={opt}
              className={cn(
                opt === "Playbook" || opt === "Starter" || opt === "Growth" || opt === "Premium"
                  ? cn(commonButtonClass, wigglyButtonClass)
                  : cn(
                      staticButtonClass,
                      commonButtonClass
                        .replace("border-red-600", "border-gray-400")
                        .replace("text-red-600", "text-gray-800"),
                    ),
                "py-3",
              )}
              onClick={() => handleButtonClick(opt)}
            >
              {opt}
            </Button>
          ))}
        </div>
      )
    }
    if (q === 5) {
      return (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[
              "Sales",
              "Efficiency",
              "Client Retention",
              "Lead Generation",
              "Hiring",
              "Branding",
              "Digital Growth",
              "Partnerships",
              "Cost Reduction",
              "Innovation",
              "Other",
            ].map((opt) => (
              <Button
                key={opt}
                className={cn(commonButtonClass, "text-xs md:text-sm")}
                onClick={() => handleButtonClick(opt)}
              >
                {opt}
              </Button>
            ))}
          </div>
          <Textarea
            ref={textareaRef}
            placeholder="E.g., I need a new business idea to boost revenue, I can't grow without one, 5 employees."
            className="border-red-600 focus:ring-red-500 font-arial min-h-[80px]"
          />
          <Button onClick={(e) => handleSubmit(e)} className="bg-red-600 hover:bg-red-700 text-white w-full font-arial">
            Submit Details
          </Button>
        </div>
      )
    }
    if (q === 6) {
      return (
        <div className="grid grid-cols-3 gap-2 mt-4">
          {["Growing Fast", "Stable", "Struggling"].map((opt) => (
            <Button
              key={opt}
              className={cn(commonButtonClass, wigglyButtonClass)}
              onClick={() => handleButtonClick(opt)}
            >
              {opt}
            </Button>
          ))}
        </div>
      )
    }
    if (q === 13) {
      return (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {["Limited Budget", "$1,000-$2,500", "Over $2,500", "Flexible"].map((opt) => (
              <Button
                key={opt}
                className={cn(commonButtonClass, wigglyButtonClass)}
                onClick={() => handleButtonClick(opt)}
              >
                {opt}
              </Button>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="space-y-2">
            <Input
              ref={inputRef}
              placeholder="Or E.g., $1,000 one-time."
              className="border-red-600 focus:ring-red-500 font-arial"
            />
            <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white w-full font-arial">
              Submit Budget
            </Button>
          </form>
        </div>
      )
    }
    if (q === 14) {
      return (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {["Immediate (30 days)", "Short-Term (60 days)", "Longer-Term (90+ days)"].map((opt) => (
              <Button
                key={opt}
                className={cn(commonButtonClass, wigglyButtonClass)}
                onClick={() => handleButtonClick(opt)}
              >
                {opt}
              </Button>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="space-y-2">
            <Input
              ref={inputRef}
              placeholder="Or E.g., Losing clients in 30 days."
              className="border-red-600 focus:ring-red-500 font-arial"
            />
            <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white w-full font-arial">
              Submit Urgency
            </Button>
          </form>
        </div>
      )
    }
    if (q === 15) {
      const showPremium = state.userData.budget === "Over $2,500" || state.userData.urgency === "Immediate (30 days)"
      return (
        <div className="grid grid-cols-1 gap-2 mt-4">
          <Button
            className={cn(commonButtonClass, wigglyButtonClass)}
            onClick={() => handleButtonClick(showPremium ? "Premium" : "Growth")}
          >
            {showPremium ? "Upgrade to Premium ($4,000)" : "Upgrade to Growth ($2,000)"}
          </Button>
          <Button className={cn(staticButtonClass, "text-gray-600")} onClick={() => handleButtonClick("No Thanks")}>
            No Thanks
          </Button>
        </div>
      )
    }
    if (q === 16) {
      let upgradeOption = ""
      if (state.userData.purchase === "Play" && state.userData.budget === "$1,000-$2,500")
        upgradeOption = "Upgrade to Starter"
      else if (state.userData.urgency === "Immediate (30 days)") upgradeOption = "Upgrade to Growth"
      return (
        <div className="grid grid-cols-2 gap-2 mt-4">
          {upgradeOption && (
            <Button
              className={cn(commonButtonClass, wigglyButtonClass)}
              onClick={() => handleButtonClick(upgradeOption)}
            >
              {upgradeOption}
            </Button>
          )}
          <Button
            className={cn(staticButtonClass, "text-gray-600")}
            onClick={() => handleButtonClick(`Keep ${state.userData.final_purchase || state.userData.purchase}`)}
          >
            Keep {state.userData.final_purchase || state.userData.purchase}
          </Button>
        </div>
      )
    }
    if (q === 17) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-4">
          {["1 Month ($300)", "3 Months ($750)", "No"].map((opt) => (
            <Button
              key={opt}
              className={cn(commonButtonClass, wigglyButtonClass, opt === "No" ? staticButtonClass : "")}
              onClick={() => handleButtonClick(opt)}
            >
              {opt}
            </Button>
          ))}
        </div>
      )
    }
    const placeholderText =
      q === 1
        ? "E.g., John Doe"
        : q === 2
          ? "E.g., Acme Plumbing, Boise, ID. Trades industry. I'm a plumber, fixing pipes and chasing leads daily."
          : q === 7
            ? "E.g., Losing clients due to slow sales, and my team's burned out."
            : q === 8
              ? "E.g., Tight budget and no online presence."
              : q === 9
                ? "E.g., Double revenue to $50K/month, track revenue growth. Settle for adding $10K."
                : q === 10
                  ? "E.g., Top-notch service and loyal clients set us apart."
                  : q === 11
                    ? "E.g., Six months ago, a key client left."
                    : q === 12
                      ? "E.g., Lack of training, plus weak online presence."
                      : "Your answer here..."
    if ([2, 7, 8, 9, 10, 11, 12].includes(q)) {
      return (
        <form onSubmit={handleSubmit} className="mt-4 space-y-2">
          <Textarea
            ref={textareaRef}
            placeholder={placeholderText}
            className="border-red-600 focus:ring-red-500 font-arial min-h-[100px]"
          />
          <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white w-full font-arial">
            Submit
          </Button>
        </form>
      )
    }
    return (
      <form onSubmit={handleSubmit} className="mt-4 space-y-2">
        <Input ref={inputRef} placeholder={placeholderText} className="border-red-600 focus:ring-red-500 font-arial" />
        <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white w-full font-arial">
          Submit
        </Button>
      </form>
    )
  }

  if (!state.sessionActive && state.invalidInputCount >= MAX_INVALID_INPUTS) {
    return (
      <Card
        className={cn(
          "w-full max-w-xl mx-auto bg-white border-red-500/20 border",
          isFullScreen ? "h-screen" : "h-[600px]",
        )}
      >
        <CardHeader className="text-center p-4 border-b border-red-500/20">
          <h2 className="font-bold text-lg text-red-600 font-arial">Session Ended</h2>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <XCircle className="mx-auto text-red-500 w-16 h-16 mb-4" />
          <p className="text-gray-700 font-arial">Too many invalid inputs. Your session has been locked.</p>
          <p className="text-gray-600 text-sm mt-2 font-arial">
            Please try again later or contact{" "}
            <a href="mailto:support@keffordconsulting.com" className="text-red-600 underline">
              support@keffordconsulting.com
            </a>
            .
          </p>
        </CardContent>
      </Card>
    )
  }

  if (state.showKLogoAnimation) {
    return (
      <div className={cn("flex items-center justify-center bg-white", isFullScreen ? "h-screen" : "h-[600px]")}>
        <Image
          src="/icons/kefford-k-logo.png"
          alt="Kefford Consulting Logo"
          width={75}
          height={75}
          className="animate-spin-logo"
        />
      </div>
    )
  }

  return (
    <Card
      className={cn(
        "w-full max-w-xl mx-auto bg-white border-red-500/20 border relative overflow-hidden font-arial",
        isFullScreen ? "h-screen flex flex-col" : "h-[700px] md:h-[600px]",
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between p-3 border-b border-red-500/20 bg-white z-10">
        <div className="flex items-center">
          <Image
            src="/icons/kefford-k-logo.png"
            alt="K Logo"
            width={30}
            height={30}
            className="animate-pulse-klogo mr-2"
          />
          <h2 className="font-bold text-sm md:text-base text-red-600">
            {state.userData.client_first_name && state.currentQuestion > 2
              ? `${state.userData.client_first_name}'s Growth Journey`
              : "Your Growth Journey"}
          </h2>
        </div>
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="icon" className="text-red-600 w-7 h-7" onClick={handleHelp} aria-label="Help">
            <HelpCircle size={18} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 w-7 h-7"
            onClick={handleSaveForLater}
            aria-label="Save for Later"
          >
            <UploadCloud size={18} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 w-7 h-7"
            onClick={toggleSound}
            aria-label="Toggle Sound"
          >
            {state.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </Button>
        </div>
      </CardHeader>
      <div
        className={cn(
          "px-3 py-1.5 bg-gray-50 text-xs flex justify-around items-center border-b border-red-500/10",
          state.currentQuestion <= 4 && "text-gray-400",
        )}
      >
        {state.currentQuestion <= 4 ? (
          <span className="italic">ROI coming soon!</span>
        ) : (
          <>
            <div className="flex items-center">
              <span className="text-green-600 font-bold">${state.potentialSavings.toLocaleString()}</span>
              <span className="ml-1 text-gray-700">Revenue Boost</span>
            </div>
            <div className="flex items-center">
              <span className="text-blue-600 font-bold">{state.timeSaved.toFixed(1)}h</span>
              <span className="ml-1 text-gray-700">Time Gained</span>
            </div>
            {(state.potentialSavings > 3000 || state.timeSaved > 5) && (
              <span className="ml-2 px-1.5 py-0.5 text-xs font-bold text-yellow-900 bg-yellow-400 rounded-full">
                2-3x
              </span>
            )}
          </>
        )}
      </div>
      <CardContent
        className={cn(
          "p-3 overflow-y-auto flex-grow",
          isFullScreen ? "h-[calc(100vh-220px)]" : "h-[calc(100%-210px)] md:h-[calc(100%-190px)]",
        )}
      >
        <div className="space-y-3">
          {state.messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.type === "bot" ? "justify-start animate-slide-in-left" : "justify-end animate-slide-in-right",
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-lg px-3 py-2 text-sm shadow-sm",
                  message.type === "bot"
                    ? "bg-red-100 text-gray-800 rounded-tl-none"
                    : "bg-white border border-red-600 text-gray-700 rounded-tr-none",
                )}
              >
                {typeof message.content === "string"
                  ? message.content.split("\n").map((line, i) => <p key={i}>{line}</p>)
                  : message.content}
              </div>
            </div>
          ))}
          {state.isTyping && (
            <div className="flex justify-start animate-slide-in-left">
              <div className="bg-red-100 rounded-lg px-3 py-2 text-sm text-gray-800 shadow-sm rounded-tl-none">
                A.C.T. is typing<span className="animate-pulse-dot-1 text-red-600">.</span>
                <span className="animate-pulse-dot-2 text-red-600">.</span>
                <span className="animate-pulse-dot-3 text-red-600">.</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        {state.currentQuestion === 5 &&
          state.messages.length > 0 &&
          !state.isTyping &&
          !state.loading &&
          state.messages[state.messages.length - 1].type === "bot" && (
            <div className="text-center text-xs text-gray-500 mt-2 animate-shimmer opacity-0">
              Waiting for your input...
            </div>
          )}
        {state.currentQuestion === 18 &&
          state.messages[state.messages.length - 1]?.type === "bot" &&
          typeof state.messages[state.messages.length - 1]?.content !== "string" && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
              {[...Array(50)].map((_, i) => (
                <div
                  key={i}
                  className="confetti bg-red-500"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDuration: `${Math.random() * 2 + 1}s`,
                    animationDelay: `${Math.random() * 1}s`,
                    width: `${Math.random() * 6 + 4}px`,
                    height: `${Math.random() * 6 + 4}px`,
                    backgroundColor: i % 2 === 0 ? "#FF0000" : "#008000",
                  }}
                ></div>
              ))}
            </div>
          )}
      </CardContent>
      <CardFooter className="border-t border-red-500/20 p-3 flex flex-col bg-white z-10">
        <div className="w-full mb-2">
          <div className="flex justify-between text-xs text-gray-600 mb-1 font-arial">
            <span>
              {progressMessages[Math.min(state.currentQuestion - 1, progressMessages.length - 1)] || "Processing..."}
            </span>
            <span>{state.progress}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-red-600 h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${state.progress}%` }}
            ></div>
          </div>
        </div>
        {state.error && <div className="text-red-600 text-xs mb-2 font-arial">{state.error}</div>}
        <div className="w-full relative">
          {state.backButtonEnabled && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-0 -top-9 text-gray-500 hover:text-gray-700 text-xs"
              onClick={handleBack}
            >
              <ArrowLeft size={14} className="mr-1" /> Back
            </Button>
          )}
          {renderQuestionInput()}
          {state.currentQuestion <= 17 && (
            <div className="absolute right-0 -top-9">
              <Button
                variant="ghost"
                size="icon"
                className="text-yellow-400 hover:text-yellow-500 w-7 h-7"
                onClick={toggleLightbulb}
                aria-label="Toggle Tip"
              >
                <LightbulbIcon size={20} className={cn(state.showLightbulb && "animate-scale-up")} />
              </Button>
              {state.showLightbulb && (
                <div className="absolute right-0 bottom-full mb-1 p-2.5 bg-yellow-50 border border-yellow-300 rounded-lg shadow-xl w-64 z-20 text-xs text-gray-700 font-arial">
                  {getLightbulbTooltipContent()}
                </div>
              )}
            </div>
          )}
        </div>
      </CardFooter>
      <audio ref={audioRef} />
      <div className="absolute bottom-1 right-1 opacity-20 pointer-events-none z-0">
        <Image src="/icons/scribble-watermark.png" alt="Watermark" width={25} height={25} />
      </div>
    </Card>
  )
}
