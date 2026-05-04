import type { Entry, Tournament, Series, Brand } from './types'

export type EntryWithRels = Entry & {
  tournament: Tournament & {
    series: Series & {
      brand: Brand | null
    }
  }
}

export type RoiSummary = {
  totalInvest: number
  totalCash: number
  profit: number
  roi: number | null
  entryCount: number
  cashCount: number
  cashRate: number | null
}

export function entryInvest(e: { buy_in: number; entry_count: number; total_invest_override: number | null }) {
  return e.total_invest_override ?? e.buy_in * e.entry_count
}

export function calcSummary(entries: EntryWithRels[]): RoiSummary {
  let totalInvest = 0
  let totalCash = 0
  let entryCount = 0
  let cashCount = 0

  for (const e of entries) {
    const invest = e.total_invest_override ?? e.buy_in * e.entry_count
    totalInvest += invest
    totalCash += e.cash_amount
    entryCount += e.entry_count
    if (e.cash_amount > 0) {
      cashCount += 1
    }
  }

  const profit = totalCash - totalInvest
  const roi = totalInvest > 0 ? (profit / totalInvest) * 100 : null
  const cashRate = entryCount > 0 ? (cashCount / entryCount) * 100 : null

  return { totalInvest, totalCash, profit, roi, entryCount, cashCount, cashRate }
}

export function groupByBrand(entries: EntryWithRels[]) {
  const map = new Map<string, { brand: Brand | null; key: string; entries: EntryWithRels[] }>()
  for (const e of entries) {
    const brand = e.tournament.series.brand
    const key = brand?.id ?? '__custom__'
    if (!map.has(key)) {
      map.set(key, { brand, key, entries: [] })
    }
    map.get(key)!.entries.push(e)
  }
  return Array.from(map.values()).map((g) => ({
    brand: g.brand,
    key: g.key,
    entries: g.entries,
    summary: calcSummary(g.entries),
  }))
}

export function groupBySeries(entries: EntryWithRels[]) {
  const map = new Map<string, { series: Series & { brand: Brand | null }; entries: EntryWithRels[] }>()
  for (const e of entries) {
    const s = e.tournament.series
    if (!map.has(s.id)) {
      map.set(s.id, { series: s, entries: [] })
    }
    map.get(s.id)!.entries.push(e)
  }
  return Array.from(map.values()).map((g) => ({
    series: g.series,
    entries: g.entries,
    summary: calcSummary(g.entries),
  }))
}

export function filterByPeriod(
  entries: EntryWithRels[],
  period: 'year' | 'month' | 'all',
  date: Date = new Date()
) {
  if (period === 'all') return entries
  if (period === 'year') {
    const y = date.getFullYear()
    return entries.filter((e) => new Date(e.played_at).getFullYear() === y)
  }
  // month
  const y = date.getFullYear()
  const m = date.getMonth()
  return entries.filter((e) => {
    const d = new Date(e.played_at)
    return d.getFullYear() === y && d.getMonth() === m
  })
}

export function formatYen(n: number, hide = false) {
  if (hide) return '¥***'
  const sign = n < 0 ? '-' : ''
  return `${sign}¥${Math.abs(n).toLocaleString()}`
}

export function formatRoi(roi: number | null) {
  if (roi === null) return '—'
  return `${roi >= 0 ? '+' : ''}${roi.toFixed(1)}%`
}

export function formatRate(rate: number | null) {
  if (rate === null) return '—'
  return `${rate.toFixed(1)}%`
}
