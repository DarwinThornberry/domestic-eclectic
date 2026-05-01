import type { Metadata } from 'next'
import { ContactForm } from '@/components/site/ContactForm'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Domestic Eclectic.',
}

export default function ContactPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-12 pb-24">
      <div className="max-w-xl">
        <p className="caption text-terracotta mb-4">Contact</p>
        <h1 className="font-display text-4xl md:text-5xl italic text-ink mb-8">
          Get in touch
        </h1>
        <p className="text-ink leading-relaxed mb-12">
          For questions about an order, enquiries about original works, or
          anything else — send a message and Lara will get back to you.
        </p>
        <ContactForm />
      </div>
    </div>
  )
}
