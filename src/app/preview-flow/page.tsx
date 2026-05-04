'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import EntryForm from '@/components/EntryForm'
import type { Tournament } from '@/lib/types'

const SAMPLE_SERIES = [
  { id: 's1', brand: 'JOPT', name: 'JOPT GF 2026', date: '2026-04-20' },
  { id: 's2', brand: 'スペーディ', name: 'スペーディ Spring 2026', date: '2026-03-15' },
  { id: 's3', brand: '戦国', name: '戦国 Spring 2026', date: '2026-03-01' },
]

const SAMPLE_NAMES = [
  'NLH Main Event DBI', 'NLH Warm-up', 'NLH Mini Main Event', 'FL 2-7TD & Badugi',
  'NLH Tag Team', 'NLH Good Game 500', 'PLO Heads-up', 'NLH Deepstack',
  "FL Dealer's Choice", 'NLH Tag Team Turbo', 'NLH Superstack Turbo', 'PLO Double Boards',
  'NLH Bigstack Hyper', 'NLH Megastack', '8-Game MIX', 'PLO Starter',
  'NLH Builder', 'NLH Good Game 2000', 'FL BaDEUCEy', 'NLH Champions Bounty',
  'NLH Good Game 1000', 'PLO Caliber', 'NLH Deepstack', 'FL 2-7 Triple Draw',
  'NLH Good Game 500 Turbo', 'NLH Superstack Turbo', 'PLO 5-Card', 'NLH Bigstack Hyper',
  'PL Badugi', 'NLH Megastack', 'FL H.O.R.S.E.', 'PLO Deep',
  'NLH Colossus', 'NLH Good Game 1000', 'FL Triple Stud', 'NLH Arena',
]

const SAMPLE_BUYINS = [10000, 12000, 15000, 18000, 20000, 25000, 30000, 50000, 100000, 120000, 150000, 200000]

const SAMPLE_TOURNAMENTS: Tournament[] = SAMPLE_NAMES.map((name, i) => ({
  id: `t${i + 1}`,
  series_id: 's1',
  number: i + 1,
  name,
  default_buy_in: SAMPLE_BUYINS[i % SAMPLE_BUYINS.length],
  created_by: null,
  created_at: '',
}))

export default function PreviewFlowPage() {
  const [selectedSeriesId, setSelectedSeriesId] = useState<string | null>(null)
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return SAMPLE_TOURNAMENTS
    const numQuery = q.replace(/^#/, '')
    return SAMPLE_TOURNAMENTS.filter((t) => {
      const numStr = String(t.number)
      return (
        t.name.toLowerCase().includes(q) ||
        numStr === numQuery ||
        numStr.startsWith(numQuery)
      )
    })
  }, [query])

  // Step 1: 大会選択
  if (!selectedSeriesId) {
    return (
      <div className="min-h-dvh px-5 pt-8 pb-12">
        <Link href="/" className="text-xs mb-3 inline-block" style={{ color: 'rgba(0,0,0,0.5)' }}>
          ← ホーム
        </Link>
        <h1 className="text-2xl mb-2 tracking-wider" style={{ color: '#005ba0', fontWeight: 700 }}>
          大会を選択
        </h1>
        <p className="text-xs mb-6" style={{ color: 'rgba(0,0,0,0.5)' }}>
          プレビュー（実データ前のモック表示）
        </p>

        <div className="space-y-4">
          {SAMPLE_SERIES.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSeriesId(s.id)}
              className="neu-card tap block p-5 w-full text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] tracking-[0.2em] mb-1" style={{ color: '#005ba0' }}>
                    {s.brand}
                  </div>
                  <div className="font-bold truncate" style={{ color: '#35414f' }}>
                    {s.name}
                  </div>
                  <div className="text-xs mt-1" style={{ color: 'rgba(0,0,0,0.5)' }}>
                    {new Date(s.date).toLocaleDateString('ja-JP')}〜
                  </div>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M9 6l6 6-6 6" stroke="#005ba0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  const series = SAMPLE_SERIES.find((s) => s.id === selectedSeriesId) ?? SAMPLE_SERIES[0]

  // Step 3: フォーム
  if (selectedTournament) {
    return (
      <div className="min-h-dvh px-5 pt-8 pb-12">
        <button
          onClick={() => setSelectedTournament(null)}
          className="text-xs mb-3"
          style={{ color: 'rgba(0,0,0,0.5)' }}
        >
          ← トナメ選択へ戻る
        </button>
        <div className="mb-5">
          <div className="text-[10px] tracking-[0.2em] mb-1" style={{ color: '#005ba0' }}>
            {series.brand}
          </div>
          <h1 className="text-xl font-bold tracking-wider" style={{ color: '#35414f' }}>
            {series.name}
          </h1>
        </div>
        <EntryForm
          tournamentId={selectedTournament.id}
          defaultBuyIn={selectedTournament.default_buy_in ?? 0}
          tournamentLabel={`#${selectedTournament.number} ${selectedTournament.name}`}
        />
      </div>
    )
  }

  // Step 2: トナメ選択
  return (
    <div className="min-h-dvh px-5 pt-8 pb-12">
      <button
        onClick={() => setSelectedSeriesId(null)}
        className="text-xs mb-3"
        style={{ color: 'rgba(0,0,0,0.5)' }}
      >
        ← 大会選択へ戻る
      </button>

      <div className="mb-5">
        <div className="text-[10px] tracking-[0.2em] mb-1" style={{ color: '#005ba0' }}>
          {series.brand}
        </div>
        <h1 className="text-xl font-bold tracking-wider" style={{ color: '#35414f' }}>
          {series.name}
        </h1>
      </div>

      <div className="text-[10px] tracking-[0.3em] mb-3" style={{ color: 'rgba(0,0,0,0.4)' }}>
        トナメを選択（{SAMPLE_TOURNAMENTS.length}件）
      </div>

      <div className="neu-pressed flex items-center px-4 py-1 mb-4">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
          <circle cx="11" cy="11" r="7" stroke="rgba(0,0,0,0.4)" strokeWidth="2" />
          <path d="M20 20l-4-4" stroke="rgba(0,0,0,0.4)" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="トナメ名 or #番号で検索"
          className="flex-1 bg-transparent py-3 px-3 outline-none text-sm"
          style={{ color: '#35414f' }}
        />
        {query && (
          <button onClick={() => setQuery('')} className="text-sm" style={{ color: 'rgba(0,0,0,0.4)' }} aria-label="クリア">
            ✕
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="neu-soft p-6 text-center">
          <p className="text-sm" style={{ color: 'rgba(0,0,0,0.5)' }}>該当するトナメがありません</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTournament(t)}
              className="neu-soft tap w-full text-left px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div
                  style={{
                    width: 48,
                    fontFamily: 'var(--font-bebas), sans-serif',
                    fontSize: 20,
                    color: '#005ba0',
                    letterSpacing: 1,
                    flexShrink: 0,
                  }}
                >
                  #{t.number}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate" style={{ color: '#35414f' }}>{t.name}</div>
                  <div className="text-xs mt-0.5" style={{ color: '#005ba0', fontWeight: 700 }}>
                    {t.default_buy_in === null ? '無料・招待' : `¥${t.default_buy_in.toLocaleString()}`}
                  </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M9 6l6 6-6 6" stroke="rgba(0,0,0,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
