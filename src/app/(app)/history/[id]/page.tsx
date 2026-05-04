import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { calcSummary, formatYen, formatRoi, entryInvest, type EntryWithRels } from '@/lib/roi'

export const dynamic = 'force-dynamic'

export default async function SeriesHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="px-5 pt-8">
        <p className="text-sm" style={{ color: 'rgba(0,0,0,0.5)' }}>ログインしてください</p>
      </div>
    )
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('hide_amounts')
    .eq('id', user.id)
    .maybeSingle()
  const hideAmounts = profile?.hide_amounts ?? false

  const { data: series } = await supabase
    .from('series')
    .select('*, brand:brands(*)')
    .eq('id', id)
    .single()

  const { data: entries } = await supabase
    .from('entries')
    .select('*, tournament:tournaments(*, series:series(*, brand:brands(*)))')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('played_at', { ascending: false })

  const filtered = ((entries ?? []) as EntryWithRels[]).filter(
    (e) => e.tournament.series_id === id
  )

  const summary = calcSummary(filtered)
  const c = summary.profit > 0 ? '#2d8659' : summary.profit < 0 ? '#c44747' : '#8a95a3'

  return (
    <div className="px-5 pt-8">
      <Link href="/history" className="flex items-center gap-1 mb-4 text-sm" style={{ color: 'rgba(0,0,0,0.5)' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        戻る
      </Link>

      {series?.brand && (
        <div className="text-[10px] tracking-[0.2em] mb-1" style={{ color: 'rgba(0,0,0,0.4)' }}>{series.brand.name}</div>
      )}
      <h1 className="text-xl font-bold mb-5 tracking-wider" style={{ color: '#35414f' }}>
        {series?.name}
      </h1>

      <div className="neu-card p-6 mb-6">
        <div className="text-4xl font-bold mb-4 text-center" style={{ color: c }}>
          {formatRoi(summary.roi)}
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs" style={{ color: 'rgba(0,0,0,0.5)' }}>
          <div>{summary.entryCount}エントリー</div>
          <div>{summary.cashCount}インマネ</div>
          <div>投資 {formatYen(summary.totalInvest, hideAmounts)}</div>
          <div>獲得 {formatYen(summary.totalCash, hideAmounts)}</div>
        </div>
      </div>

      <h2 className="text-[10px] tracking-[0.3em] mb-3 px-1" style={{ color: 'rgba(0,0,0,0.4)' }}>
        トナメ別記録
      </h2>

      <div className="space-y-3">
        {filtered.map((e) => {
          const invest = entryInvest(e)
          const profit = e.cash_amount - invest
          const ec = profit > 0 ? '#2d8659' : profit < 0 ? '#c44747' : '#8a95a3'
          return (
            <Link key={e.id} href={`/history/entry/${e.id}`} className="neu-card tap block p-4">
              <div className="flex items-center justify-between mb-1">
                <div className="text-[10px] tracking-wider" style={{ color: 'rgba(0,0,0,0.4)' }}>
                  #{e.tournament.number}
                </div>
                <div className="text-sm font-bold" style={{ color: ec }}>
                  {profit >= 0 ? '+' : ''}{formatYen(profit, hideAmounts)}
                </div>
              </div>
              <div className="text-sm mb-1 truncate font-bold" style={{ color: '#35414f' }}>
                {e.tournament.name}
              </div>
              <div className="text-xs" style={{ color: 'rgba(0,0,0,0.5)' }}>
                {e.entry_count}エントリー · {new Date(e.played_at).toLocaleDateString('ja-JP')}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
