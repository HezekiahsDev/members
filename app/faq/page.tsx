import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { submitContactForm } from "@/app/actions" // Mock server action for contact form

export default function FAQPage() {
  const faqs = [
    {
      question: "What is the ACT Bot?",
      answer:
        "The Automated Consultant Toolkit (ACT) Bot is an interactive tool designed to help Small to Medium Businesses (SMBs) identify growth opportunities, challenges, and receive personalized recommendations through a conversational interface.",
    },
    {
      question: "How long does the bot consultation take?",
      answer:
        "The initial bot consultation typically takes about 10-15 minutes to complete the 18 questions. This allows us to gather enough information to provide valuable insights.",
    },
    {
      question: "What kind of solutions do you offer?",
      answer:
        "We offer a range of solutions from downloadable PDF Plays and Playbooks to bundled services like Starter, Growth, and Premium, which include support calls and personalized consulting.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Yes, we take data security seriously. All information shared with the bot is handled according to our Privacy Policy and Terms of Service. We use secure methods for data storage and processing (mocked for this demo).",
    },
    {
      question: "What if I need more help than the bot provides?",
      answer:
        "The bot is a great starting point! For more in-depth support, our Growth and Premium bundles include direct consulting calls. You can also book individual consults through the Members Area.",
    },
  ]

  async function handleContactSubmit(formData: FormData) {
    "use server"
    const name = (formData.get("name") as string) || "Anonymous"
    const email = formData.get("email") as string
    const message = formData.get("message") as string

    if (!email || !message) {
      // Handle error - this would ideally be client-side validated too
      console.error("Email and message are required for contact form.")
      return
    }
    try {
      await submitContactForm({ name, email, message, pageSource: "FAQ Page Contact" })
      // Add success message handling if needed
      console.log("FAQ Contact form submitted via server action")
    } catch (error) {
      console.error("Failed to submit contact form:", error)
    }
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4 md:px-8 font-arial">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-red-700">Frequently Asked Questions</h1>
        <p className="text-lg text-gray-600 mt-2">
          Find answers to common questions about Kefford Consulting and the ACT Bot.
        </p>
      </header>

      <section className="max-w-3xl mx-auto mb-12">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem value={`item-${index}`} key={index}>
              <AccordionTrigger className="text-lg font-semibold text-gray-800 hover:text-red-600 text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 leading-relaxed">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="text-center py-10 bg-red-50 rounded-lg">
        <h2 className="text-2xl font-bold text-red-700 mb-4">Not finding your answer?</h2>
        <p className="text-gray-600 mb-6">
          Start a free consult with our ACT Bot to get personalized advice for your business.
        </p>
        <Link href="/bot" passHref>
          <Button className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 text-lg animate-wiggle">
            Start Free Consult
          </Button>
        </Link>
      </section>

      {/* Basic Contact Form Section */}
      <section className="max-w-xl mx-auto mt-16 py-8 border-t border-gray-200">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Still have questions? Contact Us.</h2>
        <form action={handleContactSubmit} className="space-y-4">
          <div>
            <label htmlFor="faq-name" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              id="faq-name"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="faq-email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              id="faq-email"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="faq-message" className="block text-sm font-medium text-gray-700">
              Message
            </label>
            <textarea
              name="message"
              id="faq-message"
              rows={4}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
            ></textarea>
          </div>
          <div>
            <Button type="submit" className="w-full bg-gray-700 hover:bg-gray-800 text-white">
              Send Message
            </Button>
          </div>
        </form>
      </section>
    </div>
  )
}
