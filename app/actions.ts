"use server"

// Mock server actions. In a real app, these would interact with a database, email service, etc.

type UserData = {
  client_first_name?: string
  client_last_name?: string
  business_name?: string
  location?: string
  industry_type?: string
  profession?: string
  daily_tasks?: string
  email?: string
  purchase_q4?: string
  q5_challenge?: string
  business_size?: string
  q5_keywords?: string[]
  q5_emotive_word?: string
  q5_details?: string
  business_stage?: string
  primary_issue?: string
  secondary_issue?: string
  limits?: string
  dream_outcome?: string
  success_metric?: string
  settle_outcome?: string
  strengths?: string
  challenge_start?: string
  root_cause?: string
  budget?: string
  urgency?: string
  final_purchase_q15?: string
  final_purchase_q16?: string
  support_calls?: string
  purchase_date?: string
  // And any other fields from UserData type in act-bot-v3.tsx
  [key: string]: any // Allow other properties
}

interface SaveUserDataParams {
  userId: string // email or a guest ID
  data: Partial<UserData>
}

export async function saveUserData(params: SaveUserDataParams) {
  console.log(`[SERVER ACTION] Saving user data for ${params.userId}:`, params.data)
  // In a real app:
  // const { data, error } = await supabase.from('Kefford_Users_2025').upsert({ email: params.userId, ...params.data }, { onConflict: 'email' });
  // if (error) throw new Error(error.message);
  // return data;
  return { success: true, message: "User data saved (mocked)." }
}

interface LogBotEventParams {
  eventName: string
  userId?: string
  details: Record<string, any>
}

export async function logBotEvent(params: LogBotEventParams) {
  console.log(`[SERVER ACTION] Logging bot event: ${params.eventName}`, params)
  // In a real app, log to analytics or database.
  return { success: true, message: "Event logged (mocked)." }
}

interface EmailResumeLinkParams {
  email: string
  currentQuestion: number
  userData: Partial<UserData> // Use the same UserData type
}

export async function emailResumeLinkAction(params: EmailResumeLinkParams) {
  console.log(`[SERVER ACTION] Emailing resume link to ${params.email} for Q${params.currentQuestion}`, params.userData)
  // In a real app, generate a unique resume token, store state, and send email.
  // e.g., mail.send({ to: params.email, subject: "Resume your Kefford Consulting session", html: `.../bot?resumeToken=TOKEN&q=${params.currentQuestion}`})
  return { success: true, message: "Resume link emailed (mocked)." }
}

interface SubmitContactFormParams {
  name: string
  email: string
  message: string
  pageSource: string
}

export async function submitContactForm(params: SubmitContactFormParams) {
  console.log(`[SERVER ACTION] Contact form submission from ${params.pageSource}:`, params)
  // In a real app, send email to support@ or create a ticket.
  // mail.send({ to: "support@keffordconsulting.com", subject: `Contact Form: ${params.name}`, text: params.message })
  return { success: true, message: "Contact form submitted (mocked)." }
}

interface SubmitTweakParams {
  email: string
  purchase: string // The original purchase being tweaked
  q5_challenge?: string
  business_size?: string
  dream_outcome?: string
  success_metric?: string
  settle_outcome?: string
  additional_notes?: string
}
export async function submitTweakRequest(params: SubmitTweakParams) {
  console.log(`[SERVER ACTION] Tweak request submitted for ${params.email}, purchase: ${params.purchase}`, params)
  // Logic:
  // 1. Validate tweak window (e.g., 30 days from purchase_date in UserData)
  // 2. Check if tweak already used for this purchase
  // 3. Update UserData in DB with new Q5, Q9, notes, and mark tweak as used
  // 4. Regenerate Play/Playbook (mocked - this is a complex PDF generation step)
  // 5. Email new deliverable to user: "Your Updated {purchase} Is Ready!"
  // 6. Log to Admin Dashboard (mocked)
  return { success: true, message: "Tweak request submitted and processed (mocked). Updated deliverable emailed." }
}

interface ScheduleConsultCallParams {
  email: string
  userName: string
  tweakContext?: string // Optional context if from tweak page
}
export async function schedulePaidConsult(params: ScheduleConsultCallParams) {
  console.log(`[SERVER ACTION] Paid consult scheduling for ${params.email} (${params.userName})`, params)
  // Logic:
  // 1. Integrate with Stripe for $300 payment
  // 2. Integrate with Google Calendar for booking
  // 3. Send confirmation email
  // 4. Log in Admin Dashboard
  return {
    success: true,
    bookingConfirmed: true,
    message: "Paid consult call scheduled (mocked). Payment processed and calendar invite sent.",
  }
}
