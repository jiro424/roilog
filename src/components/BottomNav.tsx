'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  {
    href: '/dashboard',
    label: 'ダッシュボード',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="7" height="7" rx="1.5" fill={active ? '#005ba0' : '#8a95a3'} />
        <rect x="14" y="3" width="7" height="7" rx="1.5" fill={active ? '#005ba0' : '#8a95a3'} />
        <rect x="3" y="14" width="7" height="7" rx="1.5" fill={active ? '#005ba0' : '#8a95a3'} />
        <rect x="14" y="14" width="7" height="7" rx="1.5" fill={active ? '#005ba0' : '#8a95a3'} />
      </svg>
    ),
  },
  {
    href: '/history',
    label: '履歴',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 8v4l3 3" stroke={active ? '#005ba0' : '#8a95a3'} strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="12" r="9" stroke={active ? '#005ba0' : '#8a95a3'} strokeWidth="2" />
      </svg>
    ),
  },
  {
    href: '/record',
    label: '記録',
    isCenter: true,
    icon: () => (
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center -mt-6"
        style={{
          background: '#005ba0',
          boxShadow: '0.5rem 0.5rem 1rem #bec4ca, -0.5rem -0.5rem 1rem #ffffff',
        }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12h14" stroke="#f2f4f9" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>
    ),
  },
  {
    href: '/mypage',
    label: 'マイページ',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" fill={active ? '#005ba0' : '#8a95a3'} />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={active ? '#005ba0' : '#8a95a3'} strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] flex items-end pb-safe"
      style={{
        background: '#dfe6ee',
        boxShadow: '0 -0.25rem 0.75rem rgba(190, 196, 202, 0.4)',
      }}
    >
      {tabs.map((tab) => {
        const active = pathname.startsWith(tab.href)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex-1 flex flex-col items-center py-2.5 gap-1"
          >
            {tab.icon(active)}
            <span
              className="text-[10px] tracking-wider"
              style={{
                color: active ? '#005ba0' : '#8a95a3',
                fontWeight: active ? 700 : 600,
              }}
            >
              {tab.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
