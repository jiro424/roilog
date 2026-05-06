'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'

export default function MypageView({
  user,
  profile,
}: {
  user: { id: string; email: string; avatar: string | null }
  profile: Profile
}) {
  const router = useRouter()
  const supabase = createClient()
  const [editing, setEditing] = useState(false)
  const [displayName, setDisplayName] = useState(profile.display_name ?? '')
  const [xHandle, setXHandle] = useState(profile.x_handle ?? '')
  const [hideAmounts, setHideAmounts] = useState(profile.hide_amounts)
  const [saving, setSaving] = useState(false)

  const avatar = profile.avatar_url ?? user.avatar

  const handleSave = async () => {
    setSaving(true)
    await supabase.from('profiles').update({
      display_name: displayName || null,
      x_handle: xHandle || null,
      hide_amounts: hideAmounts,
    }).eq('id', user.id)
    setSaving(false)
    setEditing(false)
    router.refresh()
  }

  const handleToggleHide = async (next: boolean) => {
    setHideAmounts(next)
    await supabase.from('profiles').update({ hide_amounts: next }).eq('id', user.id)
    router.refresh()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const handleExportCsv = async () => {
    const { data } = await supabase
      .from('entries')
      .select('*, tournament:tournaments(number, name, series:series(name, brand:brands(name)))')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('played_at', { ascending: false })

    const rows = (data ?? []).map((e: { played_at: string; tournament: { series: { brand: { name: string } | null; name: string }; number: number; name: string }; buy_in: number; entry_count: number; cash_amount: number; total_invest_override: number | null; total_entries: number | null; finish_position: number | null; note: string | null }) => {
      const invest = e.total_invest_override ?? e.buy_in * e.entry_count
      return {
        日付: e.played_at,
        ブランド: e.tournament.series.brand?.name ?? '',
        大会: e.tournament.series.name,
        番号: `#${e.tournament.number}`,
        トナメ: e.tournament.name,
        バイイン: e.buy_in,
        エントリー回数: e.entry_count,
        総投資: invest,
        インマネ額: e.cash_amount,
        損益: e.cash_amount - invest,
        順位: e.finish_position ?? '',
        参加人数: e.total_entries ?? '',
        メモ: e.note ?? '',
      }
    })

    if (rows.length === 0) {
      alert('記録がありません')
      return
    }

    const headers = Object.keys(rows[0])
    const csv =
      '﻿' +
      [
        headers.join(','),
        ...rows.map((r) =>
          headers.map((h) => `"${String(r[h as keyof typeof r]).replace(/"/g, '""')}"`).join(',')
        ),
      ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `roilog_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDelete = async () => {
    if (!confirm('本当にアカウントを削除しますか？\nすべての記録が削除されます。')) return
    if (!confirm('最終確認：本当に削除を実行しますか？')) return
    await supabase.rpc('delete_account')
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="px-5 pt-8">
      <h1 className="text-2xl mb-6 tracking-wider" style={{ color: '#005ba0', fontWeight: 700 }}>
        マイページ
      </h1>

      {/* プロフィール */}
      <div className="neu-card p-5 mb-5">
        <div className="flex items-center gap-4 mb-4">
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatar}
              alt=""
              className="w-16 h-16 rounded-full"
              style={{ boxShadow: '0.25rem 0.25rem 0.5rem #bec4ca, -0.25rem -0.25rem 0.5rem #ffffff' }}
            />
          ) : (
            <div className="w-16 h-16 rounded-full neu-soft flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" fill="#8a95a3" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#8a95a3" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="font-bold truncate" style={{ color: '#35414f' }}>
              {profile.display_name || user.email}
            </div>
            {profile.x_handle && (
              <div className="text-xs" style={{ color: 'rgba(0,0,0,0.5)' }}>
                {profile.x_handle}
              </div>
            )}
          </div>
        </div>

        {editing ? (
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] tracking-wider mb-1 px-1" style={{ color: 'rgba(0,0,0,0.5)' }}>表示名</label>
              <div className="neu-pressed px-3 py-1">
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-transparent py-2 outline-none text-sm"
                  style={{ color: '#35414f' }}
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] tracking-wider mb-1 px-1" style={{ color: 'rgba(0,0,0,0.5)' }}>Xアカウント</label>
              <div className="neu-pressed px-3 py-1">
                <input
                  value={xHandle}
                  onChange={(e) => setXHandle(e.target.value)}
                  placeholder="@..."
                  className="w-full bg-transparent py-2 outline-none text-sm"
                  style={{ color: '#35414f' }}
                />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setEditing(false)}
                className="neu-soft tap flex-1 py-2.5 text-sm"
                style={{ color: 'rgba(0,0,0,0.5)' }}
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="neu-button flex-1 py-2.5 text-sm"
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="neu-soft tap w-full py-2.5 text-sm font-bold tracking-wider"
            style={{ color: '#005ba0' }}
          >
            プロフィール編集
          </button>
        )}
      </div>

      {/* 設定 */}
      <h2 className="text-[10px] tracking-[0.3em] mb-3 px-1" style={{ color: 'rgba(0,0,0,0.4)' }}>SETTINGS</h2>
      <div className="neu-card mb-5 p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-bold" style={{ color: '#35414f' }}>金額を非表示</div>
            <div className="text-xs mt-0.5" style={{ color: 'rgba(0,0,0,0.5)' }}>
              Xシェア時の投資・獲得額を隠します
            </div>
          </div>
          <button
            onClick={() => handleToggleHide(!hideAmounts)}
            className="w-14 h-8 rounded-full relative transition-colors"
            style={{
              background: hideAmounts ? '#005ba0' : '#bec4ca',
              boxShadow: 'inset 0.15rem 0.15rem 0.3rem rgba(0,0,0,0.15)',
            }}
          >
            <div
              className="w-6 h-6 rounded-full bg-white absolute top-1 transition-transform"
              style={{
                transform: hideAmounts ? 'translateX(28px)' : 'translateX(4px)',
                boxShadow: '0.15rem 0.15rem 0.3rem rgba(0,0,0,0.2)',
              }}
            />
          </button>
        </div>
      </div>

      {/* データ */}
      <h2 className="text-[10px] tracking-[0.3em] mb-3 px-1" style={{ color: 'rgba(0,0,0,0.4)' }}>DATA</h2>
      <button
        onClick={handleExportCsv}
        className="neu-card tap w-full p-5 mb-5 text-left flex items-center justify-between"
      >
        <span className="text-sm font-bold" style={{ color: '#35414f' }}>CSVエクスポート</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M9 6l6 6-6 6" stroke="rgba(0,0,0,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* アカウント */}
      <button
        onClick={handleLogout}
        className="neu-card tap w-full p-5 mb-3 text-left text-sm font-bold"
        style={{ color: '#35414f' }}
      >
        ログアウト
      </button>

      <button
        onClick={handleDelete}
        className="neu-card tap w-full p-5 mb-8 text-left text-sm font-bold"
        style={{ color: '#c44747' }}
      >
        アカウント削除
      </button>
    </div>
  )
}
