'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function CustomRecordPage() {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [seriesName, setSeriesName] = useState('')
  const [tournamentName, setTournamentName] = useState('')
  const [buyIn, setBuyIn] = useState(0)
  const [entryCount, setEntryCount] = useState(1)
  const [cashAmount, setCashAmount] = useState(0)
  const [investOverride, setInvestOverride] = useState<number | null>(null)
  const [totalEntries, setTotalEntries] = useState<number | ''>('')
  const [finishPosition, setFinishPosition] = useState<number | ''>('')
  const [playedAt, setPlayedAt] = useState(new Date().toISOString().slice(0, 10))
  const [note, setNote] = useState('')

  const autoInvest = buyIn * entryCount
  const totalInvest = investOverride ?? autoInvest
  const isOverridden = investOverride !== null
  const profit = cashAmount - totalInvest
  const roi = totalInvest > 0 ? (profit / totalInvest) * 100 : null
  const profitColor = profit > 0 ? '#2d8659' : profit < 0 ? '#c44747' : '#8a95a3'

  const handleSave = async () => {
    if (!seriesName.trim() || !tournamentName.trim()) {
      setError('大会名とトナメ名を入力してください')
      return
    }
    setSaving(true)
    setError(null)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('ログインが必要です'); setSaving(false); return }

    const { data: series, error: seriesErr } = await supabase
      .from('series')
      .insert({ name: seriesName.trim(), created_by: user.id, started_at: playedAt })
      .select().single()
    if (seriesErr || !series) { setError(seriesErr?.message ?? '大会の登録に失敗しました'); setSaving(false); return }

    const { data: tournament, error: tourErr } = await supabase
      .from('tournaments')
      .insert({
        series_id: series.id, number: 1, name: tournamentName.trim(),
        default_buy_in: buyIn, created_by: user.id,
      }).select().single()
    if (tourErr || !tournament) { setError(tourErr?.message ?? 'トナメの登録に失敗しました'); setSaving(false); return }

    const { error: entryErr } = await supabase.from('entries').insert({
      user_id: user.id, tournament_id: tournament.id,
      buy_in: buyIn, entry_count: entryCount, cash_amount: cashAmount,
      total_invest_override: investOverride,
      total_entries: totalEntries === '' ? null : Number(totalEntries),
      finish_position: finishPosition === '' ? null : Number(finishPosition),
      played_at: playedAt, note: note || null,
    })
    if (entryErr) { setError(entryErr.message); setSaving(false); return }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="px-5 pt-8 pb-8">
      <Link href="/record" className="flex items-center gap-1 mb-4 text-sm" style={{ color: 'rgba(0,0,0,0.5)' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        戻る
      </Link>

      <h1 className="text-2xl mb-6 tracking-wider" style={{ color: '#005ba0', fontWeight: 700 }}>
        自分で入力
      </h1>

      <div className="space-y-5">
        <Field label="大会名 / 店舗名">
          <div className="neu-pressed px-4 py-1">
            <input
              type="text"
              value={seriesName}
              onChange={(e) => setSeriesName(e.target.value)}
              placeholder=""
              className="w-full bg-transparent py-3 outline-none"
              style={{ color: '#35414f' }}
            />
          </div>
        </Field>

        <Field label="トナメ名">
          <div className="neu-pressed px-4 py-1">
            <input
              type="text"
              value={tournamentName}
              onChange={(e) => setTournamentName(e.target.value)}
              placeholder=""
              className="w-full bg-transparent py-3 outline-none"
              style={{ color: '#35414f' }}
            />
          </div>
        </Field>

        <Field label="エントリー回数">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setEntryCount(Math.max(1, entryCount - 1))}
              className="w-12 h-12 rounded-full flex items-center justify-center neu-soft tap"
            >
              <span className="text-xl" style={{ color: '#35414f' }}>−</span>
            </button>
            <div className="flex-1 text-center text-3xl font-bold" style={{ color: '#005ba0' }}>
              {entryCount}
            </div>
            <button
              onClick={() => setEntryCount(entryCount + 1)}
              className="w-12 h-12 rounded-full flex items-center justify-center neu-soft tap"
            >
              <span className="text-xl" style={{ color: '#35414f' }}>＋</span>
            </button>
          </div>
        </Field>

        <Field label="バイイン">
          <div className="neu-pressed flex items-center px-4 py-1">
            <span style={{ color: 'rgba(0,0,0,0.5)' }}>¥</span>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={buyIn}
              onChange={(e) => setBuyIn(Number(e.target.value.replace(/[^0-9]/g, '')) || 0)}
              className="flex-1 bg-transparent py-3 px-2 outline-none text-right text-lg font-bold"
              style={{ color: '#35414f' }}
            />
          </div>
        </Field>

        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <label className="text-[10px] tracking-wider" style={{ color: 'rgba(0,0,0,0.5)' }}>
              総投資額（編集可）
            </label>
            {isOverridden && (
              <button
                onClick={() => setInvestOverride(null)}
                className="text-[10px] tracking-wider"
                style={{ color: '#005ba0', fontWeight: 700 }}
              >
                自動計算に戻す
              </button>
            )}
          </div>
          <div className="neu-pressed flex items-center px-4 py-1">
            <span style={{ color: 'rgba(0,0,0,0.5)' }}>¥</span>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={totalInvest}
              onChange={(e) => {
                const v = Number(e.target.value.replace(/[^0-9]/g, '')) || 0
                setInvestOverride(v === autoInvest ? null : v)
              }}
              className="flex-1 bg-transparent py-3 px-2 outline-none text-right text-lg font-bold"
              style={{ color: isOverridden ? '#005ba0' : '#35414f' }}
            />
          </div>
          {!isOverridden && (
            <div className="text-[10px] mt-1 px-1" style={{ color: 'rgba(0,0,0,0.4)' }}>
              自動計算：バイイン × エントリー回数
            </div>
          )}
          {isOverridden && (
            <div className="text-[10px] mt-1 px-1" style={{ color: '#005ba0' }}>
              手動で入力中（自動計算は ¥{autoInvest.toLocaleString()}）
            </div>
          )}
        </div>

        <Field label="インマネ額（飛んだ場合は0）">
          <div className="neu-pressed flex items-center px-4 py-1">
            <span style={{ color: 'rgba(0,0,0,0.5)' }}>¥</span>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={cashAmount}
              onChange={(e) => setCashAmount(Number(e.target.value.replace(/[^0-9]/g, '')) || 0)}
              className="flex-1 bg-transparent py-3 px-2 outline-none text-right text-lg font-bold"
              style={{ color: '#35414f' }}
            />
          </div>
        </Field>

        <div className="neu-card p-5">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs tracking-wider" style={{ color: 'rgba(0,0,0,0.5)' }}>損益</span>
            <span className="text-xl font-bold" style={{ color: profitColor }}>
              {profit >= 0 ? '+' : ''}¥{profit.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs tracking-wider" style={{ color: 'rgba(0,0,0,0.5)' }}>ROI</span>
            <span className="text-xl font-bold" style={{ color: profitColor }}>
              {roi === null ? '—' : `${roi >= 0 ? '+' : ''}${roi.toFixed(1)}%`}
            </span>
          </div>
        </div>

        <Field label="順位 / 参加人数（任意）">
          <div className="flex items-center gap-2">
            <div className="neu-pressed flex-1 flex items-center px-4 py-1">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="順位"
                value={finishPosition}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9]/g, '')
                  setFinishPosition(v === '' ? '' : Number(v))
                }}
                className="w-full bg-transparent py-3 outline-none text-center"
                style={{ color: '#35414f' }}
              />
            </div>
            <span style={{ color: 'rgba(0,0,0,0.4)' }}>/</span>
            <div className="neu-pressed flex-1 flex items-center px-4 py-1">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="参加人数"
                value={totalEntries}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9]/g, '')
                  setTotalEntries(v === '' ? '' : Number(v))
                }}
                className="w-full bg-transparent py-3 outline-none text-center"
                style={{ color: '#35414f' }}
              />
            </div>
          </div>
        </Field>

        <Field label="プレイ日">
          <div className="neu-pressed px-4 py-1">
            <input
              type="date"
              value={playedAt}
              onChange={(e) => setPlayedAt(e.target.value)}
              className="w-full bg-transparent py-3 outline-none"
              style={{ color: '#35414f' }}
            />
          </div>
        </Field>

        <Field label="メモ（任意）">
          <div className="neu-pressed px-4 py-1">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="w-full bg-transparent py-3 outline-none resize-none"
              style={{ color: '#35414f' }}
            />
          </div>
        </Field>

        {error && (
          <div className="neu-soft p-3 text-sm text-center" style={{ color: '#c44747' }}>
            {error}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="neu-button w-full py-4 text-base disabled:opacity-50"
        >
          {saving ? '保存中...' : '記録する'}
        </button>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] tracking-wider mb-2 px-1" style={{ color: 'rgba(0,0,0,0.5)' }}>
        {label}
      </label>
      {children}
    </div>
  )
}
