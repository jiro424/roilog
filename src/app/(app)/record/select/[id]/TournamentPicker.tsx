'use client'

import { useMemo, useState } from 'react'
import EntryForm from '@/components/EntryForm'
import type { Tournament } from '@/lib/types'

export default function TournamentPicker({ tournaments }: { tournaments: Tournament[] }) {
  const [selected, setSelected] = useState<Tournament | null>(null)
  const [query, setQuery] = useState('')
  const [buyInFilters, setBuyInFilters] = useState<Set<number>>(new Set())

  const buyInOptions = useMemo(() => {
    const values = tournaments
      .map((t) => t.default_buy_in)
      .filter((v): v is number => v !== null)
    return [...new Set(values)].sort((a, b) => a - b)
  }, [tournaments])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return tournaments.filter((t) => {
      if (buyInFilters.size > 0 && (t.default_buy_in === null || !buyInFilters.has(t.default_buy_in))) return false
      if (!q) return true
      const numQuery = q.replace(/^#/, '')
      const numStr = String(t.number)
      return (
        t.name.toLowerCase().includes(q) ||
        numStr === numQuery ||
        numStr.startsWith(numQuery)
      )
    })
  }, [tournaments, query, buyInFilters])

  if (tournaments.length === 0) {
    return (
      <div className="neu-soft p-6 text-center">
        <p className="text-sm" style={{ color: 'rgba(0,0,0,0.5)' }}>
          この大会にトナメが登録されていません
        </p>
      </div>
    )
  }

  if (selected) {
    return (
      <div>
        <button
          onClick={() => setSelected(null)}
          className="text-xs mb-4"
          style={{ color: 'rgba(0,0,0,0.5)' }}
        >
          ← トナメ選択へ戻る
        </button>
        <EntryForm
          tournamentId={selected.id}
          defaultBuyIn={selected.default_buy_in ?? 0}
          tournamentLabel={`#${selected.number} ${selected.name}`}
        />
      </div>
    )
  }

  return (
    <div>
      <div className="text-[10px] tracking-[0.3em] mb-3" style={{ color: 'rgba(0,0,0,0.4)' }}>
        トナメを選択（{tournaments.length}件）
      </div>

      {/* 検索 */}
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
          <button
            onClick={() => setQuery('')}
            className="text-sm"
            style={{ color: 'rgba(0,0,0,0.4)' }}
            aria-label="クリア"
          >
            ✕
          </button>
        )}
      </div>

      {/* バイインフィルター */}
      {buyInOptions.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-4">
          {buyInOptions.map((v) => {
            const active = buyInFilters.has(v)
            return (
              <button
                key={v}
                onClick={() => {
                  setBuyInFilters((prev) => {
                    const next = new Set(prev)
                    next.has(v) ? next.delete(v) : next.add(v)
                    return next
                  })
                }}
                className="px-3 py-1 rounded-full text-xs font-bold transition-colors"
                style={{
                  background: active ? '#005ba0' : undefined,
                  color: active ? '#fff' : '#005ba0',
                  boxShadow: active
                    ? 'inset 0.15rem 0.15rem 0.3rem rgba(0,0,0,0.2)'
                    : '0.2rem 0.2rem 0.4rem #bec4ca, -0.2rem -0.2rem 0.4rem #ffffff',
                }}
              >
                ¥{v.toLocaleString()}
              </button>
            )
          })}
        </div>
      )}

      {/* リスト */}
      {filtered.length === 0 ? (
        <div className="neu-soft p-6 text-center">
          <p className="text-sm" style={{ color: 'rgba(0,0,0,0.5)' }}>
            該当するトナメがありません
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelected(t)}
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
                  <div className="text-sm font-bold truncate" style={{ color: '#35414f' }}>
                    {t.name}
                  </div>
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
