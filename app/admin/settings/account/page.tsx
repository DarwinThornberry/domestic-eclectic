export const metadata = { title: 'Account' }

export default function AccountPage() {
  return (
    <div className="px-6 lg:px-10 py-10 max-w-2xl">
      <div className="mb-10">
        <p className="caption text-terracotta tracking-[0.16em] mb-2">SETTINGS</p>
        <h1 className="font-display text-4xl italic text-ink">Account</h1>
        <p className="text-sm text-ink-muted mt-2">Your login and security settings.</p>
      </div>

      <div className="flex flex-col gap-6 max-w-lg">
        <div className="border border-border px-6 py-5">
          <h3 className="text-sm text-ink mb-2">Change password</h3>
          <p className="text-sm text-ink-muted leading-relaxed mb-4">
            To update your password, use the password reset flow. Enter your email address and
            we'll send you a secure link.
          </p>
          <a
            href="/forgot-password"
            className="inline-block border border-ink px-5 py-3 text-sm text-ink hover:bg-ink hover:text-bone transition-colors"
          >
            Send reset link
          </a>
        </div>
      </div>
    </div>
  )
}
