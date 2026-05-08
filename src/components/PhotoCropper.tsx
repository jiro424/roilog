'use client'

import { useCallback, useState } from 'react'
import Cropper from 'react-easy-crop'
import { getCroppedImg, type Area } from '@/lib/cropImage'

type Props = {
  imageSrc: string
  /** スロットのアスペクト比（width / height）。シェアカードの写真枠は 420/380 */
  aspect?: number
  onCancel: () => void
  onCropped: (croppedDataUrl: string) => void
}

export default function PhotoCropper({
  imageSrc,
  aspect = 420 / 380,
  onCancel,
  onCropped,
}: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [busy, setBusy] = useState(false)

  const onCropComplete = useCallback((_: Area, areaPx: Area) => {
    setCroppedAreaPixels(areaPx)
  }, [])

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return
    setBusy(true)
    try {
      const dataUrl = await getCroppedImg(imageSrc, croppedAreaPixels, 1080)
      onCropped(dataUrl)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: '#1a1a1a' }}
    >
      {/* ヘッダー */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
      >
        <button onClick={onCancel} className="text-sm py-2 px-3" disabled={busy}>
          キャンセル
        </button>
        <div className="text-xs tracking-wider opacity-70">トリミング</div>
        <button
          onClick={handleConfirm}
          disabled={busy || !croppedAreaPixels}
          className="text-sm py-2 px-3 font-bold"
          style={{ color: '#5fb6ff' }}
        >
          {busy ? '処理中…' : '完了'}
        </button>
      </div>

      {/* クロップエリア */}
      <div className="relative flex-1">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          objectFit="contain"
        />
      </div>

      {/* ズームスライダー */}
      <div className="px-6 py-5" style={{ background: '#1a1a1a' }}>
        <div className="text-[10px] tracking-[0.3em] mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
          ZOOM
        </div>
        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-full"
          aria-label="zoom"
        />
        <div className="text-[10px] mt-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
          ドラッグで位置調整 / ピンチまたはスライダーで拡大
        </div>
      </div>
    </div>
  )
}
