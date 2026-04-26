import type { Metadata } from 'next'

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
        <p className="text-ink-muted leading-relaxed mb-12">
          For questions about an order, enquiries about original works, or
          anything else — send a message and Lara will get back to you.
        </p>

        <form className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="caption text-ink">
              Your name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="border border-border bg-transparent px-4 py-3 text-ink placeholder:text-ink-muted/40 focus:outline-none focus:border-terracotta transition-colors"
              placeholder="Full name"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="caption text-ink">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="border border-border bg-transparent px-4 py-3 text-ink placeholder:text-ink-muted/40 focus:outline-none focus:border-terracotta transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="message" className="caption text-ink">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={6}
              className="border border-border bg-transparent px-4 py-3 text-ink placeholder:text-ink-muted/40 focus:outline-none focus:border-terracotta transition-colors resize-none"
              placeholder="Your message…"
            />
          </div>

          <button
            type="submit"
            className="self-start caption text-bone bg-ink px-8 py-3 hover:bg-terracotta transition-colors"
          >
            Send message
          </button>
        </form>
      </div>
    </div>
  )
}
