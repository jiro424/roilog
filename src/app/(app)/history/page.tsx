import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  groupBySeries,
  formatYen,
  formatRoi,
  formatRate,
  type EntryWithRels,
} from '@/lib/roi'

export const dynamic = 'force-dynamic'

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let entries: EntryWithRels[] = []
  let hideAmounts = false

  if (user) {
    const { data: prof } = await supabase
      .from('profiles')
      .select('hide_amounts')
      .eq('id', user.id)
      .maybeSingle()
    hideAmounts = prof?.hide_amounts ?? false

    const { data } = await supabase
      .from('entries')
      .select('*, tournament:tournaments(*, series:series(*, brand:brands(*)))')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('played_at', { ascending: false })
    entries = (data ?? []) as EntryWithRels[]
  }

  const groups = groupBySeries(entries).sort((a, b) => {
    const ad = a.entries[0]?.played_at ?? ''
    const bd = b.entries[0]?.played_at ?? ''
    return bd.localeCompare(ad)
  })

  return (
    <div className="px-5 pt-8">
      <h1 className="text-2xl mb-6 tracking-wider" style={{ color: '#005ba0', fontWeight: 700 }}>
        履歴
      </h1>

      {!user && (
        <div className="neu-soft p-6 text-center">
          <p className="text-sm" style={{ color: 'rgba(0,0,0,0.5)' }}>
            ログインすると記録が表示されます
          </p>
        </div>
      )}

      {user && groups.length === 0 && (
        <div className="neu-soft p-6 text-center">
          <p className="text-sm" style={{ color: 'rgba(0,0,0,0.5)' }}>
            まだ記録がありません
          </p>
        </div>
      )}

      <div className="space-y-4">
        {groups.map((g) => {
          const c =
            g.summary.profit > 0 ? '#2d8659' : g.summary.profit < 0 ? '#c44747' : '#8a95a3'
          return (
            <Link
              key={g.series.id}
              href={`/history/${g.series.id}`}
              className="neu-card tap block p-5"
            >
              {g.series.brand && (
                <div className="text-[10px] tracking-[0.2em] mb-1" style={{ color: 'rgba(0,0,0,0.4)' }}>
                  {g.series.brand.name}
                </div>
              )}
              <div className="flex items-center justify-between mb-3">
                <div className="font-bold flex-1 truncate pr-2" style={{ color: '#35414f' }}>
                  {g.series.name}
                </div>
                <span className="font-bold text-lg" style={{ color: c }}>
                  {formatRoi(g.summary.roi)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs" style={{ color: 'rgba(0,0,0,0.5)' }}>
                <div>{g.summary.entryCount}エントリー</div>
                <div>インマネ率 {formatRate(g.summary.cashRate)}</div>
                <div>投資 {formatYen(g.summary.totalInvest, hideAmounts)}</div>
                <div>獲得 {formatYen(g.summary.totalCash, hideAmounts)}</div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
