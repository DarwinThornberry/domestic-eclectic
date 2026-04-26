'use client'

export function NewsletterForm() {
  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        // Newsletter integration added in Phase 5
      }}
    >
      <input
        type="email"
        placeholder="your@email.com"
        className="flex-1 text-sm border border-border bg-transparent px-3 py-2 text-ink placeholder:text-ink-muted/50 focus:outline-none focus:border-terracotta transition-colors"
      />
      <button
        type="submit"
        className="caption text-ink-muted border border-border px-4 py-2 hover:bg-ink hover:text-bone hover:border-ink transition-colors"
      >
        Join
      </button>
    </form>
  )
}
