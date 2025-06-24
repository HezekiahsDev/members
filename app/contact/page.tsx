import Link from "next/link"
import { Button } from "@/components/ui/button"
import { submitContactForm } from "@/app/actions" // Mock server action
import { Mail, Phone, MapPin } from "lucide-react"

export default function ContactPage() {
  async function handleFormSubmit(formData: FormData) {
    "use server"
    const name = (formData.get("name") as string) || "Anonymous"
    const email = formData.get("email") as string
    const subject = formData.get("subject") as string
    const message = formData.get("message") as string

    if (!email || !message || !subject) {
      console.error("Email, subject, and message are required.")
      return // Add proper error handling for the client
    }

    try {
      await submitContactForm({ name, email, message: `Subject: ${subject}\n\n${message}`, pageSource: "Contact Page" })
      console.log("Contact form submitted via server action from Contact Page")
      // Potentially redirect or show a success message
    } catch (error) {
      console.error("Failed to submit contact form from Contact Page:", error)
    }
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4 md:px-8 font-arial">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-red-700">Get In Touch</h1>
        <p className="text-lg text-gray-600 mt-2">We're here to help and answer any question you might have.</p>
      </header>

      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12">
        {/* Contact Form */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Send Us a Message</h2>
          <form action={handleFormSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                className="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                id="email"
                required
                className="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                Subject
              </label>
              <input
                type="text"
                name="subject"
                id="subject"
                required
                className="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                Message
              </label>
              <textarea
                name="message"
                id="message"
                rows={5}
                required
                className="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
              ></textarea>
            </div>
            <div>
              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3">
                Send Message
              </Button>
            </div>
          </form>
        </section>

        {/* Contact Info & Bot CTA */}
        <section className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Contact Information</h2>
            <div className="space-y-3 text-gray-700">
              <p className="flex items-center">
                <MapPin size={20} className="mr-3 text-red-600" /> Boise, ID, USA (Primary Operations)
              </p>
              <p className="flex items-center">
                <Mail size={20} className="mr-3 text-red-600" />{" "}
                <a href="mailto:support@keffordconsulting.com" className="hover:text-red-600">
                  support@keffordconsulting.com
                </a>
              </p>
              <p className="flex items-center">
                <Phone size={20} className="mr-3 text-red-600" /> (Mock Number) +1 (208) 555-0123
              </p>
            </div>
          </div>

          <div className="mt-10 p-6 bg-red-50 rounded-lg text-center">
            <h3 className="text-xl font-semibold text-red-700 mb-3">Need quick help or personalized advice?</h3>
            <p className="text-gray-600 mb-5">
              Our ACT Bot can guide you through your business challenges and offer instant recommendations.
            </p>
            <Link href="/bot" passHref>
              <Button className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 text-lg animate-wiggle">
                Start Free Consult
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
