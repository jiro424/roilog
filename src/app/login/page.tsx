'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/Logo'

function isWebView(ua: string) {
  return /Twitter|twitterm|Instagram|FBAV|FBAN|Line\/|MicroMessenger|GSA\/|YahooMobile/i.test(ua)
}

export default function LoginPage() {
  const supabase = createClient()
  const [webView, setWebView] = useState(false)

  useEffect(() => {
    setWebView(isWebView(navigator.userAgent))
  }, [])

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-8">
      <div className="mb-16 text-center">
        <Logo size={80} withTagline />
        <p className="text-sm tracking-wider mt-4" style={{ color: '#35414f' }}>
          ポーカー収支管理アプリ
        </p>
      </div>

      {webView ? (
        <div className="w-full max-w-xs">
          <div
            className="neu-soft p-5 mb-6 text-center"
            style={{ borderLeft: '3px solid #c44747' }}
          >
            <div className="text-sm font-bold mb-2" style={{ color: '#c44747' }}>
              このブラウザではログインできません
            </div>
            <div className="text-xs leading-relaxed" style={{ color: '#35414f' }}>
              Xアプリ内ブラウザからのGoogleログインはブロックされます。
              <br /><br />
              下部URLバーの <span className="font-bold">「…」</span> →{' '}
              <span className="font-bold">「ブラウザで開く」</span> を選択してからアクセスしてください。
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={handleGoogleLogin}
          className="neu-button w-full max-w-xs py-4 text-base flex items-center justify-center gap-3 mb-6"
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" opacity="0.85" />
            <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" opacity="0.7" />
            <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" opacity="0.55" />
          </svg>
          Googleでログイン
        </button>
      )}
    </div>
  )
}
