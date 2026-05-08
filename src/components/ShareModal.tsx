'use client'

import { useEffect, useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import ShareCard from './ShareCard'
import PhotoCropper from './PhotoCropper'
import type { RoiSummary, EntryWithRels } from '@/lib/roi'

type Props = {
  open: boolean
  onClose: () => void
  title: string
  brandName?: string
  summary: RoiSummary
  hideAmounts: boolean
  entries?: EntryWithRels[]
}

export default function ShareModal({ open, onClose, title, brandName, summary, hideAmounts, entries }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [cashOnly, setCashOnly] = useState(false)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [pickedSrc, setPickedSrc] = useState<string | null>(null)

  // インマネが0件のときは cashOnly は無効化
  const cashOnlyAvailable = summary.cashCount > 0
  const effectiveCashOnly = cashOnly && cashOnlyAvailable

  useEffect(() => {
    if (!open) {
      setPreviewUrl(null)
      setCashOnly(false)
      setPhotoUrl(null)
      setPickedSrc(null)
      return
    }
    let active = true
    const t = setTimeout(async () => {
      if (!cardRef.current) return
      try {
        await document.fonts.ready
        const canvas = await html2canvas(cardRef.current, {
          backgroundColor: '#dfe6ee',
          scale: 1,
          logging: false,
          useCORS: true,
        })
        if (active) setPreviewUrl(canvas.toDataURL('image/png'))
      } catch (e) {
        console.error(e)
      }
    }, 200)
    return () => { active = false; clearTimeout(t) }
  }, [open, effectiveCashOnly, photoUrl])

  const handlePickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') setPickedSrc(reader.result)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const buildText = () => {
    const head = `${brandName ? `[${brandName}] ` : ''}${title}`
    const lines = effectiveCashOnly
      ? [
          head,
          `🏆 ${summary.cashCount}インマネ${hideAmounts ? '' : ` / 獲得 ¥${summary.totalCash.toLocaleString()}`}`,
          `🃏 ROILOG - Tournament ROI Tracker`,
          `https://roilog.vercel.app`,
          `#ROILOG #ポーカー`,
        ]
      : [
          head,
          `🎰 ${summary.entryCount}エントリー / ${summary.cashCount}インマネ`,
          `📈 ROI ${summary.roi === null ? '—' : `${summary.roi >= 0 ? '+' : ''}${summary.roi.toFixed(1)}%`}`,
          `🃏 ROILOG - Tournament ROI Tracker`,
          `https://roilog.vercel.app`,
          `#ROILOG #ポーカー`,
        ]
    return lines.join('\n')
  }

  const handleShare = async () => {
    if (!cardRef.current) return
    setBusy(true)
    try {
      await document.fonts.ready
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#dfe6ee',
        scale: 2,
        logging: false,
        useCORS: true,
      })
      const blob: Blob = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b!), 'image/png')
      )
      const file = new File([blob], 'roilog.png', { type: 'image/png' })
      const text = buildText()

      // Web Share API（モバイル）
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], text })
          setBusy(false)
          onClose()
          return
        } catch {
          // ユーザーキャンセルなど → フォールバックへ
        }
      }

      // フォールバック：画像ダウンロード ＋ Xインテント
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'roilog.png'
      a.click()
      URL.revokeObjectURL(url)

      const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
      window.open(intent, '_blank', 'noopener')
    } finally {
      setBusy(false)
      onClose()
    }
  }

  if (!open) return null

  return (
    <>
      {/* 画面外でカードをレンダリング（html2canvas用） */}
      <div
        style={{
          position: 'fixed',
          left: -10000,
          top: 0,
          pointerEvents: 'none',
          opacity: 0,
        }}
      >
        <div ref={cardRef}>
          <ShareCard
            title={title}
            brandName={brandName}
            summary={summary}
            hideAmounts={hideAmounts}
            entries={entries}
            cashOnly={effectiveCashOnly}
            photoUrl={photoUrl ?? undefined}
          />
        </div>
      </div>

      {/* モーダル */}
      <div
        className="fixed inset-0 z-50 flex items-end justify-center"
        style={{ background: 'rgba(53, 65, 79, 0.6)' }}
        onClick={onClose}
      >
        <div
          className="w-full max-w-[430px] p-5 pb-8"
          style={{ background: '#dfe6ee', borderRadius: '1.5rem 1.5rem 0 0' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-center mb-4">
            <div style={{ width: 40, height: 4, borderRadius: 2, background: '#bec4ca' }} />
          </div>

          <h2 className="text-lg font-bold mb-1 tracking-wider" style={{ color: '#005ba0' }}>
            シェアする
          </h2>
          <p className="text-xs mb-4" style={{ color: 'rgba(0,0,0,0.5)' }}>
            画像とテキストでXに投稿します
          </p>

          {/* モード切替 */}
          <div className="neu-pressed p-1 mb-4 flex gap-1 rounded-full">
            <button
              onClick={() => setCashOnly(false)}
              className="flex-1 py-2 text-xs font-bold rounded-full transition-all"
              style={{
                background: !effectiveCashOnly ? '#005ba0' : 'transparent',
                color: !effectiveCashOnly ? '#fff' : 'rgba(0,0,0,0.5)',
              }}
            >
              ROI表示
            </button>
            <button
              onClick={() => setCashOnly(true)}
              disabled={!cashOnlyAvailable}
              className="flex-1 py-2 text-xs font-bold rounded-full transition-all disabled:opacity-40"
              style={{
                background: effectiveCashOnly ? '#005ba0' : 'transparent',
                color: effectiveCashOnly ? '#fff' : 'rgba(0,0,0,0.5)',
              }}
              title={cashOnlyAvailable ? '' : 'インマネしたエントリーがありません'}
            >
              インマネのみ
            </button>
          </div>

          {/* 写真追加/編集 */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePickFile}
            className="hidden"
          />
          {!photoUrl ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="neu-soft tap w-full py-2.5 mb-4 text-xs font-bold flex items-center justify-center gap-2"
              style={{ color: 'rgba(0,0,0,0.6)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M3 7h3l2-2h8l2 2h3v12H3V7z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2" />
              </svg>
              写真を追加
            </button>
          ) : (
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setPickedSrc(photoUrl)}
                className="neu-soft tap flex-1 py-2.5 text-xs font-bold"
                style={{ color: 'rgba(0,0,0,0.6)' }}
              >
                トリミング再調整
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="neu-soft tap flex-1 py-2.5 text-xs font-bold"
                style={{ color: 'rgba(0,0,0,0.6)' }}
              >
                写真を変更
              </button>
              <button
                onClick={() => setPhotoUrl(null)}
                className="neu-soft tap py-2.5 px-4 text-xs font-bold"
                style={{ color: '#c44747' }}
              >
                削除
              </button>
            </div>
          )}

          {/* プレビュー */}
          <div
            className="neu-pressed mb-5 overflow-hidden flex items-center justify-center p-2"
            style={{ minHeight: 280, maxHeight: '60vh' }}
          >
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="preview"
                style={{ maxWidth: '100%', maxHeight: '60vh', objectFit: 'contain' }}
              />
            ) : (
              <div className="text-xs" style={{ color: 'rgba(0,0,0,0.4)' }}>
                プレビュー生成中...
              </div>
            )}
          </div>

          <button
            onClick={handleShare}
            disabled={busy}
            className="neu-button w-full py-4 text-base mb-2 disabled:opacity-50"
          >
            {busy ? '生成中...' : (
              <span className="flex items-center justify-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.261 5.633 5.903-5.633Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                ポストする
              </span>
            )}
          </button>
          <button
            onClick={onClose}
            className="neu-soft tap w-full py-3 text-sm font-bold"
            style={{ color: 'rgba(0,0,0,0.5)' }}
          >
            キャンセル
          </button>
        </div>
      </div>

      {pickedSrc && (
        <PhotoCropper
          imageSrc={pickedSrc}
          aspect={420 / 480}
          onCancel={() => setPickedSrc(null)}
          onCropped={(dataUrl) => {
            setPhotoUrl(dataUrl)
            setPickedSrc(null)
          }}
        />
      )}
    </>
  )
}
