'use client'

import { useMemo, useState } from 'react'
import {
  calcSummary,
  filterByPeriod,
  formatYen,
  formatRoi,
  formatRate,
  groupByBrand,
  groupBySeries,
  type EntryWithRels,
  type RoiSummary,
} from '@/lib/roi'
import ShareModal from '@/components/ShareModal'

type Period = 'year' | 'month' | 'all'

export default function DashboardView({
  entries,
  hideAmounts,
  loggedIn,
}: {
  entries: EntryWithRels[]
  hideAmounts: boolean
  loggedIn: boolean
}) {
  const [period, setPeriod] = useState<Period>('year')
  const [monthDate, setMonthDate] = useState(new Date())
  const [expanded, setExpanded] = useState<string | null>(null)
  const [share, setShare] = useState<{
    title: string
    brandName?: string
    summary: RoiSummary
    entries: EntryWithRels[]
  } | null>(null)

  const filtered = useMemo(
    () => filterByPeriod(entries, period, monthDate),
    [entries, period, monthDate]
  )

  const summary = useMemo(() => calcSummary(filtered), [filtered])
  const brandGroups = useMemo(
    () =>
      groupByBrand(filtered).sort((a, b) => {
        const ar = a.summary.roi ?? -Infinity
        const br = b.summary.roi ?? -Infinity
        return br - ar
      }),
    [filtered]
  )

  const profitColor = summary.profit > 0 ? '#2d8659' : summary.profit < 0 ? '#c44747' : '#8a95a3'

  const monthLabel = `${monthDate.getFullYear()}年${monthDate.getMonth() + 1}月`

  return (
    <div className="px-5 pt-8">
      <h1 className="text-2xl mb-5 tracking-wider" style={{ color: '#005ba0', fontWeight: 700 }}>
        ダッシュボード
      </h1>

      {/* 期間切り替え */}
      <div className="neu-pressed flex p-1.5 mb-5">
        {(['year', 'month', 'all'] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className="flex-1 py-2 rounded-lg text-xs tracking-wider transition-all"
            style={{
              background: period === p ? '#005ba0' : 'transparent',
              color: period === p ? '#f2f4f9' : 'rgba(0,0,0,0.5)',
              fontWeight: 700,
              boxShadow: period === p ? '0.25rem 0.25rem 0.5rem rgba(190,196,202,0.6)' : 'none',
            }}
          >
            {p === 'year' ? '今年' : p === 'month' ? '月別' : '全期間'}
          </button>
        ))}
      </div>

      {period === 'month' && (
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1))}
            className="w-10 h-10 rounded-full flex items-center justify-center neu-soft tap"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="#35414f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="font-bold tracking-wider" style={{ color: '#35414f' }}>
            {monthLabel}
          </div>
          <button
            onClick={() => setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1))}
            className="w-10 h-10 rounded-full flex items-center justify-center neu-soft tap"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M9 6l6 6-6 6" stroke="#35414f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}

      {/* メインROI */}
      <div className="neu-card p-6 mb-6 text-center relative">
        {summary.entryCount > 0 && (
          <button
            onClick={() => {
              const periodLabel =
                period === 'year'
                  ? `${new Date().getFullYear()}年`
                  : period === 'month'
                  ? `${monthDate.getFullYear()}年${monthDate.getMonth() + 1}月`
                  : '全期間'
              setShare({ title: `${periodLabel}の成績`, summary, entries: filtered })
            }}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center neu-soft tap"
            aria-label="シェア"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M4 12v7a2 2 0 002 2h12a2 2 0 002-2v-7M16 6l-4-4-4 4M12 2v13" stroke="#005ba0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        <div className="text-[10px] tracking-[0.3em] mb-3" style={{ color: 'rgba(0,0,0,0.4)' }}>ROI</div>
        <div className="text-5xl font-bold mb-5 tracking-tight" style={{ color: profitColor }}>
          {formatRoi(summary.roi)}
        </div>
        <div className="grid grid-cols-2 gap-4 text-left">
          <SummaryItem label="総投資" value={formatYen(summary.totalInvest, hideAmounts)} />
          <SummaryItem label="総獲得" value={formatYen(summary.totalCash, hideAmounts)} />
          <SummaryItem label="インマネ率" value={formatRate(summary.cashRate)} />
          <SummaryItem label="エントリー" value={`${summary.entryCount}回`} />
        </div>
      </div>

      {/* ブランド別 */}
      {brandGroups.length > 0 && (
        <>
          <h2 className="text-xs font-bold tracking-wider mb-3 px-1" style={{ color: 'rgba(0,0,0,0.5)' }}>
            大会別ROI
          </h2>
          <div className="space-y-3 mb-6">
            {brandGroups.map((g) => {
              const isOpen = expanded === g.key
              const seriesGroups = isOpen
                ? groupBySeries(g.entries).sort((a, b) => {
                    const ar = a.summary.roi ?? -Infinity
                    const br = b.summary.roi ?? -Infinity
                    return br - ar
                  })
                : []
              const c =
                g.summary.profit > 0 ? '#2d8659' : g.summary.profit < 0 ? '#c44747' : '#8a95a3'

              return (
                <div key={g.key} className="neu-card overflow-hidden">
                  <button
                    onClick={() => setExpanded(isOpen ? null : g.key)}
                    className="w-full p-5 text-left"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-bold tracking-wider" style={{ color: '#35414f' }}>
                        {g.brand?.name ?? '店舗・その他'}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg" style={{ color: c }}>
                          {formatRoi(g.summary.roi)}
                        </span>
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          style={{
                            transform: isOpen ? 'rotate(180deg)' : 'none',
                            transition: 'transform 0.2s',
                          }}
                        >
                          <path d="M6 9l6 6 6-6" stroke="rgba(0,0,0,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs" style={{ color: 'rgba(0,0,0,0.5)' }}>
                      <div>インマネ率 {formatRate(g.summary.cashRate)}</div>
                      <div>{g.summary.entryCount}エントリー</div>
                      <div>投資 {formatYen(g.summary.totalInvest, hideAmounts)}</div>
                      <div>獲得 {formatYen(g.summary.totalCash, hideAmounts)}</div>
                    </div>
                  </button>

                  {isOpen && seriesGroups.length > 0 && (
                    <div
                      className="px-5 pb-4 pt-3 space-y-1"
                      style={{ borderTop: '1px solid rgba(190,196,202,0.5)' }}
                    >
                      {seriesGroups.map((sg) => {
                        const sc =
                          sg.summary.profit > 0
                            ? '#2d8659'
                            : sg.summary.profit < 0
                            ? '#c44747'
                            : '#8a95a3'
                        return (
                          <div key={sg.series.id} className="flex items-center justify-between py-2">
                            <div className="text-sm flex-1 truncate pr-2" style={{ color: '#35414f' }}>
                              {sg.series.name}
                            </div>
                            <span className="text-sm font-bold mr-3" style={{ color: sc }}>
                              {formatRoi(sg.summary.roi)}
                            </span>
                            <button
                              onClick={() =>
                                setShare({
                                  title: sg.series.name,
                                  brandName: g.brand?.name,
                                  summary: sg.summary,
                                  entries: sg.entries,
                                })
                              }
                              className="w-8 h-8 rounded-full flex items-center justify-center neu-soft tap"
                              aria-label="シェア"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M4 12v7a2 2 0 002 2h12a2 2 0 002-2v-7M16 6l-4-4-4 4M12 2v13" stroke="#005ba0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}

      {filtered.length === 0 && (
        <div className="neu-soft p-6 text-center">
          <p className="text-sm" style={{ color: 'rgba(0,0,0,0.5)' }}>
            {loggedIn
              ? 'まだ記録がありません'
              : 'ログインすると記録が表示されます'}
          </p>
        </div>
      )}

      <ShareModal
        open={share !== null}
        onClose={() => setShare(null)}
        title={share?.title ?? ''}
        brandName={share?.brandName}
        summary={share?.summary ?? { totalInvest: 0, totalCash: 0, profit: 0, roi: null, entryCount: 0, cashCount: 0, cashRate: null }}
        hideAmounts={hideAmounts}
        entries={share?.entries}
      />
    </div>
  )
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] tracking-wider mb-0.5" style={{ color: 'rgba(0,0,0,0.4)' }}>{label}</div>
      <div className="text-sm font-bold" style={{ color: '#35414f' }}>{value}</div>
    </div>
  )
}
