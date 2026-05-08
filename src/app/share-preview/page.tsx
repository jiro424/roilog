'use client'

import { useState } from 'react'
import ShareModal from '@/components/ShareModal'
import ShareCard from '@/components/ShareCard'
import type { RoiSummary, EntryWithRels } from '@/lib/roi'

const mockEntries = (
  count: number,
  brandName: string,
  seriesName: string
): EntryWithRels[] => {
  const sampleNames = [
    'NLH Main Event DBI',
    'NLH Warm-up',
    'PLO Heads-up',
    'NLH Deepstack',
    'NLH Megastack',
    '8-Game MIX',
    'NLH Good Game 1000',
    'PLO Caliber',
    'FL Triple Stud',
    'NLH 6-max',
    'NLH Bigstack Hyper',
    'NLH Lucky7',
    'NLH Builder',
    'NLH Arena',
    'PLO Night',
    'NLH Turbo',
    'NLH Superstack',
    'NLH Colossus',
  ]
  return Array.from({ length: count }, (_, i) => {
    const buyIn = [10000, 12000, 15000, 20000, 30000, 50000, 100000][i % 7]
    const entryCount = (i % 3) + 1
    const totalEntries = 200 + i * 137
    const finishPosition = i % 4 === 0 ? Math.max(1, Math.floor(totalEntries * 0.005)) : Math.floor(totalEntries * 0.5) + i * 13
    const won = i % 4 === 0
    const cashAmount = won ? buyIn * entryCount * (5 + i % 8) : 0
    return {
      id: `e${i}`,
      user_id: 'u',
      tournament_id: `t${i}`,
      buy_in: buyIn,
      entry_count: entryCount,
      cash_amount: cashAmount,
      total_invest_override: null,
      total_entries: totalEntries,
      finish_position: finishPosition,
      played_at: '2026-04-25',
      note: null,
      created_at: '',
      updated_at: '',
      deleted_at: null,
      tournament: {
        id: `t${i}`,
        series_id: 's1',
        number: i + 1,
        name: sampleNames[i % sampleNames.length],
        default_buy_in: buyIn,
        scheduled_at: null,
        created_by: null,
        created_at: '',
        series: {
          id: 's1',
          brand_id: 'b1',
          name: seriesName,
          started_at: '2026-04-20',
          is_published: true,
          created_by: null,
          created_at: '',
          brand: { id: 'b1', name: brandName, created_at: '' },
        },
      },
    } as EntryWithRels
  })
}

const summarize = (entries: EntryWithRels[]): RoiSummary => {
  let totalInvest = 0,
    totalCash = 0,
    entryCount = 0,
    cashCount = 0
  for (const e of entries) {
    totalInvest += e.buy_in * e.entry_count
    totalCash += e.cash_amount
    entryCount += e.entry_count
    if (e.cash_amount > 0) cashCount++
  }
  const profit = totalCash - totalInvest
  return {
    totalInvest,
    totalCash,
    profit,
    roi: totalInvest > 0 ? (profit / totalInvest) * 100 : null,
    entryCount,
    cashCount,
    cashRate: entryCount > 0 ? (cashCount / entryCount) * 100 : null,
  }
}

const SAMPLE_PHOTO = 'https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=800&q=80'

export default function SharePreviewPage() {
  const [share, setShare] = useState<{
    title: string
    brandName?: string
    summary: RoiSummary
    entries: EntryWithRels[]
  } | null>(null)
  const [showPhotoPreview, setShowPhotoPreview] = useState(false)

  const open = (count: number, title: string, brandName?: string) => {
    const entries = mockEntries(count, brandName ?? 'JOPT', title)
    setShare({ title, brandName, summary: summarize(entries), entries })
  }

  const sampleEntries = mockEntries(8, 'JOPT', 'JOPT GF 2026')
  const sampleSummary = summarize(sampleEntries)

  return (
    <div className="px-5 pt-8 pb-12 space-y-4">
      <h1 className="text-2xl tracking-wider mb-2" style={{ color: '#005ba0', fontWeight: 700 }}>
        シェアカード プレビュー
      </h1>
      <p className="text-xs mb-6" style={{ color: 'rgba(0,0,0,0.5)' }}>
        トナメ数によって画像サイズが伸縮します
      </p>

      <button
        onClick={() => open(3, 'JOPT GF 2026', 'JOPT')}
        className="neu-button w-full py-4"
      >
        小（3トナメ）
      </button>

      <button
        onClick={() => open(8, 'JOPT GF 2026', 'JOPT')}
        className="neu-button w-full py-4"
      >
        中（8トナメ）
      </button>

      <button
        onClick={() => open(16, 'JOPT GF 2026', 'JOPT')}
        className="neu-button w-full py-4"
      >
        大（16トナメ）
      </button>

      <button
        onClick={() => open(20, 'JOPT GF 2026', 'JOPT')}
        className="neu-button w-full py-4"
      >
        超過（20トナメ → 16表示＋他4件）
      </button>

      {/* 写真ありプレビュー */}
      <div className="pt-4">
        <div className="text-[10px] tracking-[0.3em] mb-3" style={{ color: 'rgba(0,0,0,0.4)' }}>
          写真追加レイアウト（検討中）
        </div>
        <button
          onClick={() => setShowPhotoPreview(!showPhotoPreview)}
          className="neu-button w-full py-4"
        >
          {showPhotoPreview ? '写真ありレイアウトを隠す' : '📷 写真ありレイアウトを確認'}
        </button>
        {showPhotoPreview && (
          <div className="mt-4 overflow-x-auto">
            <div style={{ transform: 'scale(0.35)', transformOrigin: 'top left', width: 1080, marginBottom: -700 }}>
              <ShareCard
                title="JOPT GF 2026"
                brandName="JOPT"
                summary={sampleSummary}
                hideAmounts={false}
                entries={sampleEntries}
                photoUrl={SAMPLE_PHOTO}
              />
            </div>
          </div>
        )}
      </div>

      <ShareModal
        open={share !== null}
        onClose={() => setShare(null)}
        title={share?.title ?? ''}
        brandName={share?.brandName}
        summary={share?.summary ?? { totalInvest: 0, totalCash: 0, profit: 0, roi: null, entryCount: 0, cashCount: 0, cashRate: null }}
        hideAmounts={false}
        entries={share?.entries}
      />
    </div>
  )
}
