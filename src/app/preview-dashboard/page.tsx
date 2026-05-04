'use client'

import DashboardView from '@/app/(app)/dashboard/DashboardView'
import type { EntryWithRels } from '@/lib/roi'

const SAMPLE_DATA: Array<{ brand: string; series: string; entries: Array<[string, number, number, number, number?, number?, string?]> }> = [
  {
    brand: 'JOPT',
    series: 'JOPT GF 2026',
    entries: [
      ['NLH Main Event DBI', 1, 120000, 850000, 12, 1320, '2026-04-25'],
      ['NLH Warm-up', 2, 12000, 0, undefined, undefined, '2026-04-21'],
      ['PLO Heads-up', 1, 30000, 0, undefined, undefined, '2026-04-22'],
      ['NLH Megastack', 1, 25000, 90000, 8, 350, '2026-04-23'],
      ['NLH Deepstack', 1, 20000, 0, undefined, undefined, '2026-04-24'],
      ['NLH Good Game 500', 1, 50000, 220000, 5, 280, '2026-04-26'],
    ],
  },
  {
    brand: 'JOPT',
    series: 'JOPT #4 2025',
    entries: [
      ['NLH Main Event', 2, 80000, 0, undefined, undefined, '2025-11-15'],
      ['NLH Warm-up', 1, 10000, 35000, 7, 200, '2025-11-13'],
    ],
  },
  {
    brand: 'スペーディ',
    series: 'スペーディ Spring 2026',
    entries: [
      ['NLH Main', 1, 60000, 180000, 6, 240, '2026-03-15'],
      ['NLH Side', 1, 20000, 0, undefined, undefined, '2026-03-16'],
      ['PLO Side', 2, 15000, 45000, 4, 80, '2026-03-17'],
    ],
  },
  {
    brand: '戦国',
    series: '戦国 Spring 2026',
    entries: [
      ['NLH Main Event', 1, 50000, 0, undefined, undefined, '2026-03-01'],
      ['NLH Mini', 1, 20000, 70000, 8, 150, '2026-03-02'],
    ],
  },
]

let idCounter = 1
const nextId = () => `id-${idCounter++}`

const mockEntries: EntryWithRels[] = []
const seriesIdMap = new Map<string, string>()
const brandIdMap = new Map<string, string>()

for (const block of SAMPLE_DATA) {
  if (!brandIdMap.has(block.brand)) brandIdMap.set(block.brand, nextId())
  const brandId = brandIdMap.get(block.brand)!
  if (!seriesIdMap.has(block.series)) seriesIdMap.set(block.series, nextId())
  const seriesId = seriesIdMap.get(block.series)!

  block.entries.forEach((row, i) => {
    const [name, entryCount, buyIn, cashAmount, position, total, playedAt] = row
    const tournamentId = nextId()
    const entry: EntryWithRels = {
      id: nextId(),
      user_id: 'preview',
      tournament_id: tournamentId,
      buy_in: buyIn,
      entry_count: entryCount,
      cash_amount: cashAmount,
      total_invest_override: null,
      total_entries: total ?? null,
      finish_position: position ?? null,
      played_at: playedAt ?? '2026-04-20',
      note: null,
      created_at: '',
      updated_at: '',
      deleted_at: null,
      tournament: {
        id: tournamentId,
        series_id: seriesId,
        number: i + 1,
        name,
        default_buy_in: buyIn,
        created_by: null,
        created_at: '',
        series: {
          id: seriesId,
          brand_id: brandId,
          name: block.series,
          started_at: playedAt ?? '2026-04-20',
          is_published: true,
          created_by: null,
          created_at: '',
          brand: {
            id: brandId,
            name: block.brand,
            created_at: '',
          },
        },
      },
    }
    mockEntries.push(entry)
  })
}

export default function PreviewDashboardPage() {
  return (
    <div className="pb-12">
      <div className="px-5 pt-4 mb-2 text-xs" style={{ color: 'rgba(0,0,0,0.5)' }}>
        プレビュー（モックデータ表示）
      </div>
      <DashboardView entries={mockEntries} hideAmounts={false} loggedIn={true} />
    </div>
  )
}
