import { formatYen, formatRoi, entryInvest, type RoiSummary, type EntryWithRels } from '@/lib/roi'

type Props = {
  title: string
  brandName?: string
  summary: RoiSummary
  hideAmounts: boolean
  entries?: EntryWithRels[]
  photoUrl?: string
  cashOnly?: boolean
}

const WIDTH = 1080
const HEADER_H = 220
const HERO_H = 380
const FOOTER_H = 140
const ROW_H = 76
const LIST_PADDING_Y = 56
const LIST_HEADER_H = 60

const COLOR = {
  bg: '#ffffff',
  bgSoft: '#f7f8fa',
  bgGray: '#eef1f5',
  border: '#e5e7eb',
  borderLight: '#d1d5db',
  text: '#0a0a0a',
  textSub: '#1f2937',
  textMuted: '#4b5563',
  textDim: '#6b7280',
  textFaint: '#9ca3af',
  brand: '#005ba0',
  brandDark: '#004b87',
  green: '#2f9e6f',
  red: '#d14a58',
  gold: '#C9A84C',
  silver: '#B0B7BE',
  bronze: '#B37535',
}

const FONT_DISPLAY = 'var(--font-bebas), "Hiragino Kaku Gothic Pro", sans-serif'
const FONT_BODY = 'var(--font-outfit), var(--font-noto-jp), "Hiragino Kaku Gothic Pro", sans-serif'

export default function ShareCard({ title, brandName, summary, hideAmounts, entries = [], photoUrl, cashOnly }: Props) {
  const roiColor =
    summary.profit > 0 ? COLOR.green : summary.profit < 0 ? COLOR.red : COLOR.textDim

  const sortedEntries = [...entries].sort((a, b) => {
    const ap = a.finish_position ?? Infinity
    const bp = b.finish_position ?? Infinity
    if (ap !== bp) return ap - bp
    const aProfit = a.cash_amount - entryInvest(a)
    const bProfit = b.cash_amount - entryInvest(b)
    return bProfit - aProfit
  })

  // cashOnlyモードではインマネしたエントリーのみ表示
  const displayEntries = cashOnly
    ? sortedEntries.filter((e) => e.cash_amount > 0)
    : sortedEntries

  const MAX_ROWS = 16
  const visibleEntries = displayEntries.slice(0, MAX_ROWS)
  const remaining = displayEntries.length - visibleEntries.length

  const listH =
    visibleEntries.length === 0
      ? 0
      : LIST_PADDING_Y * 2 + LIST_HEADER_H + visibleEntries.length * ROW_H + (remaining > 0 ? 60 : 0)
  const totalH = Math.max(1080, HEADER_H + HERO_H + listH + FOOTER_H)

  return (
    <div
      style={{
        width: WIDTH,
        height: totalH,
        background: COLOR.bg,
        fontFamily: FONT_BODY,
        color: COLOR.text,
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
      }}
    >
      {/* HEADER */}
      <div
        style={{
          padding: '50px 64px 30px',
          borderBottom: `1px solid ${COLOR.border}`,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 32,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 76,
              letterSpacing: 2,
              lineHeight: 1.1,
              color: COLOR.text,
            }}
          >
            {title}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 56,
              letterSpacing: 4,
              color: COLOR.brand,
              lineHeight: 1,
            }}
          >
            ROILOG
          </div>
          <div style={{ fontSize: 16, color: COLOR.textFaint, marginTop: 6, letterSpacing: 1 }}>
            Tournament ROI Tracker
          </div>
        </div>
      </div>

      {/* HERO - cashOnly */}
      {cashOnly && (
        photoUrl ? (
          <div style={{ background: COLOR.bgSoft, display: 'grid', gridTemplateColumns: '420px 1fr', minHeight: HERO_H }}>
            {/* 左：写真 */}
            <div style={{ overflow: 'hidden' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
            {/* 右：stats */}
            <div style={{ padding: '40px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 32 }}>
              <BigStat label="ENTRIES" value={`${summary.entryCount}`} />
              <BigStat label="CASHES" value={`${summary.cashCount}`} color={COLOR.green} />
              <BigStat label="PRIZE" value={formatYen(summary.totalCash, hideAmounts)} color={COLOR.green} />
            </div>
          </div>
        ) : (
          <div style={{ padding: '60px 64px 70px', background: COLOR.bgSoft, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 80, minHeight: HERO_H }}>
            <BigStat label="ENTRIES" value={`${summary.entryCount}`} large />
            <div style={{ width: 1, height: 120, background: COLOR.border }} />
            <BigStat label="CASHES" value={`${summary.cashCount}`} color={COLOR.green} large />
            <div style={{ width: 1, height: 120, background: COLOR.border }} />
            <BigStat label="PRIZE" value={formatYen(summary.totalCash, hideAmounts)} color={COLOR.green} large />
          </div>
        )
      )}

      {/* HERO - 通常（ROI表示） */}
      {/* HERO - 通常（ROI表示） */}
      {!cashOnly && (
        photoUrl ? (
          <div
            style={{
              background: COLOR.bgSoft,
              display: 'grid',
              gridTemplateColumns: '420px 1fr',
              minHeight: HERO_H,
            }}
          >
            {/* 左：写真 */}
            <div style={{ overflow: 'hidden' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoUrl}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
            {/* 右：ROI + stats */}
            <div style={{ padding: '40px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, letterSpacing: 6, color: COLOR.textDim, marginBottom: 8 }}>
                RETURN ON INVESTMENT
              </div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 160, letterSpacing: 0, lineHeight: 1, color: roiColor, fontWeight: 400 }}>
                {formatRoi(summary.roi)}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0 20px', marginTop: 28, width: '100%' }}>
                <Stat label="ENTRIES" value={`${summary.entryCount}`} small center />
                <Stat label="CASHES" value={`${summary.cashCount}`} small center />
                <Stat label="INVEST" value={formatYen(summary.totalInvest, hideAmounts)} small center />
                <Stat label="CASH" value={formatYen(summary.totalCash, hideAmounts)} small center />
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              padding: '60px 64px 70px',
              background: COLOR.bgSoft,
              display: 'grid',
              gridTemplateColumns: '1.1fr 1fr',
              gap: 40,
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, letterSpacing: 6, color: COLOR.textDim, marginBottom: 12 }}>
                RETURN ON INVESTMENT
              </div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 180, letterSpacing: 0, lineHeight: 1.1, color: roiColor, fontWeight: 400 }}>
                {formatRoi(summary.roi)}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 32px' }}>
              <Stat label="ENTRIES" value={`${summary.entryCount}`} />
              <Stat label="CASHES" value={`${summary.cashCount}`} />
              <Stat label="INVEST" value={formatYen(summary.totalInvest, hideAmounts)} small />
              <Stat label="CASH" value={formatYen(summary.totalCash, hideAmounts)} small />
            </div>
          </div>
        )
      )}

      {/* TOURNAMENTS */}
      {visibleEntries.length > 0 && (
        <div style={{ padding: `${LIST_PADDING_Y}px 64px`, flex: 1 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 24,
              paddingBottom: 16,
              borderBottom: `2px solid ${COLOR.text}`,
            }}
          >
            <div
              style={{
                fontFamily: FONT_DISPLAY,
                fontSize: 36,
                letterSpacing: 4,
                color: COLOR.text,
              }}
            >
              {cashOnly ? 'CASHED TOURNAMENTS' : 'TOURNAMENTS'}
            </div>
            <div style={{ fontSize: 22, color: COLOR.textDim, fontWeight: 600 }}>
              {cashOnly ? `${visibleEntries.length} CASHES` : `${entries.length} EVENTS`}
            </div>
          </div>

          {visibleEntries.map((e, idx) => {
            const profit = e.cash_amount - entryInvest(e)
            const c = cashOnly ? COLOR.green : (profit > 0 ? COLOR.green : profit < 0 ? COLOR.red : COLOR.textDim)
            const rank =
              e.finish_position && e.total_entries
                ? `${e.finish_position}/${e.total_entries}`
                : e.finish_position
                ? `${e.finish_position}位`
                : '—'
            return (
              <div
                key={e.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  minHeight: ROW_H,
                  padding: '14px 0',
                  borderBottom:
                    idx === visibleEntries.length - 1
                      ? 'none'
                      : `1px solid ${COLOR.border}`,
                  fontSize: 26,
                  lineHeight: 1.4,
                }}
              >
                <div
                  style={{
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    paddingRight: 16,
                    paddingBottom: 4,
                    paddingTop: 4,
                    fontWeight: 500,
                    color: COLOR.textSub,
                    lineHeight: 1.6,
                  }}
                >
                  #{e.tournament.number} {e.tournament.name}
                </div>
                <div
                  style={{
                    width: 160,
                    textAlign: 'right',
                    color: COLOR.textDim,
                    fontFamily: FONT_BODY,
                    fontWeight: 600,
                    fontSize: 22,
                  }}
                >
                  {rank}
                </div>
                <div
                  style={{
                    width: 240,
                    textAlign: 'right',
                    color: c,
                    fontFamily: FONT_DISPLAY,
                    fontSize: 30,
                    letterSpacing: 1,
                    lineHeight: 1.2,
                  }}
                >
                  {cashOnly ? formatYen(e.cash_amount, hideAmounts) : `${profit >= 0 ? '+' : ''}${formatYen(profit, hideAmounts)}`}
                </div>
              </div>
            )
          })}
          {remaining > 0 && (
            <div
              style={{
                marginTop: 20,
                fontSize: 22,
                color: COLOR.textDim,
                textAlign: 'center',
                fontWeight: 600,
              }}
            >
              +{remaining} more events
            </div>
          )}
        </div>
      )}

      {/* FOOTER */}
      <div
        style={{
          padding: '30px 64px',
          background: COLOR.text,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 32,
            letterSpacing: 6,
          }}
        >
          #ROILOG
        </div>
        <div style={{ fontSize: 18, color: COLOR.textFaint, letterSpacing: 1 }}>
          Tournament ROI Tracker
        </div>
      </div>
    </div>
  )
}

function BigStat({
  label,
  value,
  color,
  large,
}: {
  label: string
  value: string
  color?: string
  large?: boolean
}) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, letterSpacing: 5, color: COLOR.textDim, marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: large ? 100 : 72, letterSpacing: 1, lineHeight: 1, color: color ?? COLOR.text }}>
        {value}
      </div>
    </div>
  )
}

function Stat({
  label,
  value,
  small,
  center,
}: {
  label: string
  value: string
  small?: boolean
  center?: boolean
}) {
  return (
    <div style={{ textAlign: center ? 'center' : 'left' }}>
      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 18,
          letterSpacing: 4,
          color: COLOR.textDim,
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: small ? 38 : 56,
          letterSpacing: 1,
          lineHeight: 1,
          color: COLOR.text,
        }}
      >
        {value}
      </div>
    </div>
  )
}
