import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import EntryForm from '@/components/EntryForm'

export const dynamic = 'force-dynamic'

export default async function EditEntryPage({
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

  const { data: entry } = await supabase
    .from('entries')
    .select('*, tournament:tournaments(*)')
    .eq('id', id)
    .single()

  if (!entry) {
    return (
      <div className="px-5 pt-8">
        <p className="text-sm" style={{ color: '#c44747' }}>記録が見つかりません</p>
      </div>
    )
  }

  return (
    <div className="px-5 pt-8 pb-8">
      <Link href="/history" className="flex items-center gap-1 mb-4 text-sm" style={{ color: 'rgba(0,0,0,0.5)' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        戻る
      </Link>

      <h1 className="text-2xl mb-6 tracking-wider" style={{ color: '#005ba0', fontWeight: 700 }}>
        記録を編集
      </h1>

      <EntryForm
        tournamentId={entry.tournament_id}
        defaultBuyIn={entry.tournament.default_buy_in ?? 0}
        tournamentLabel={`#${entry.tournament.number} ${entry.tournament.name}`}
        existingEntry={{
          id: entry.id,
          buy_in: entry.buy_in,
          entry_count: entry.entry_count,
          cash_amount: entry.cash_amount,
          total_invest_override: entry.total_invest_override ?? null,
          total_entries: entry.total_entries ?? null,
          finish_position: entry.finish_position ?? null,
          played_at: entry.played_at,
          note: entry.note,
        }}
      />
    </div>
  )
}
