import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Series, Brand } from '@/lib/types'

export default async function SelectSeriesPage({
  searchParams,
}: {
  searchParams: Promise<{ all?: string }>
}) {
  const params = await searchParams
  const showAll = params.all === '1'

  const supabase = await createClient()
  let query = supabase
    .from('series')
    .select('*, brand:brands(*)')
    .eq('is_published', true)
    .is('created_by', null)
    .order('started_at', { ascending: false, nullsFirst: false })

  if (!showAll) {
    query = query.limit(6)
  }

  const { data: series, error } = await query

  return (
    <div className="px-5 pt-8">
      <Link href="/record" className="flex items-center gap-1 mb-4 text-sm" style={{ color: 'rgba(0,0,0,0.5)' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        戻る
      </Link>

      <h1 className="text-2xl mb-6 tracking-wider" style={{ color: '#005ba0', fontWeight: 700 }}>
        大会を選択
      </h1>

      {error && (
        <div className="neu-soft p-4 mb-4 text-sm text-center" style={{ color: '#c44747' }}>
          データの取得に失敗しました
        </div>
      )}

      {!error && (!series || series.length === 0) && (
        <div className="neu-soft p-6 text-center">
          <p className="text-sm" style={{ color: 'rgba(0,0,0,0.5)' }}>
            まだ大会が登録されていません
          </p>
        </div>
      )}

      <div className="space-y-4">
        {series?.map((s: Series & { brand: Brand | null }) => (
          <Link key={s.id} href={`/record/select/${s.id}`} className="neu-card tap block p-5">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                {s.brand && (
                  <div className="text-[10px] tracking-[0.2em] mb-1" style={{ color: 'rgba(0,0,0,0.4)' }}>
                    {s.brand.name}
                  </div>
                )}
                <div className="font-bold truncate" style={{ color: '#35414f' }}>
                  {s.name}
                </div>
                {s.started_at && (
                  <div className="text-xs mt-1" style={{ color: 'rgba(0,0,0,0.5)' }}>
                    {new Date(s.started_at).toLocaleDateString('ja-JP')}〜
                  </div>
                )}
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 6l6 6-6 6" stroke="#005ba0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      {!showAll && series && series.length === 6 && (
        <Link
          href="/record/select?all=1"
          className="neu-soft tap block text-center mt-6 py-3 text-sm font-bold tracking-wider"
          style={{ color: '#005ba0' }}
        >
          もっと見る
        </Link>
      )}
    </div>
  )
}
