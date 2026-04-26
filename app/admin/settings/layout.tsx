import { SettingsSubNav, SettingsMobileNav } from '@/components/admin/settings/SettingsSubNav'

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full">
      <SettingsMobileNav />
      <div className="flex flex-1 min-h-0">
        <SettingsSubNav />
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
