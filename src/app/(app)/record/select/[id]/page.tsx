import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import TournamentPicker from './TournamentPicker'

export default async function SelectTournamentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: series } = await supabase
    .from('series')
    .select('*, brand:brands(*)')
    .eq('id', id)
    .single()

  const { data: tournaments } = await supabase
    .from('tournaments')
    .select('id, series_id, number, name, default_buy_in, scheduled_at, created_by, created_at')
    .eq('series_id', id)
    .order('number', { ascending: true })

  if (!series) {
    return (
      <div className="px-5 pt-8">
        <p className="text-sm" style={{ color: '#c44747' }}>大会が見つかりません</p>
      </div>
    )
  }

  return (
    <div className="px-5 pt-8 pb-8">
      <Link href="/record/select" className="flex items-center gap-1 mb-4 text-sm" style={{ color: 'rgba(0,0,0,0.5)' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        戻る
      </Link>

      <div className="mb-5">
        {series.brand && (
          <div className="text-[10px] tracking-[0.2em] mb-1" style={{ color: 'rgba(0,0,0,0.4)' }}>{series.brand.name}</div>
        )}
        <h1 className="text-xl font-bold tracking-wider" style={{ color: '#35414f' }}>{series.name}</h1>
      </div>

      <TournamentPicker tournaments={tournaments ?? []} />
    </div>
  )
}
