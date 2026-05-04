import Link from 'next/link'

export default function RecordPage() {
  return (
    <div className="px-5 pt-8">
      <h1 className="text-2xl mb-2 tracking-wider" style={{ color: '#005ba0', fontWeight: 700 }}>
        記録する
      </h1>
      <p className="text-sm mb-8" style={{ color: 'rgba(0,0,0,0.5)' }}>
        入力方法を選択してください
      </p>

      <div className="space-y-5">
        <Link href="/record/select" className="neu-card tap block p-6">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center neu-soft"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"
                  stroke="#005ba0"
                  strokeWidth="2"
                />
                <path
                  d="M9 8h6M9 12h6M9 16h4"
                  stroke="#005ba0"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-lg font-bold tracking-wider" style={{ color: '#35414f' }}>
                大会から選択
              </div>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 6l6 6-6 6"
                stroke="#005ba0"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </Link>

        <Link href="/record/custom" className="neu-card tap block p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center neu-soft">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
                  stroke="#35414f"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-lg font-bold tracking-wider" style={{ color: '#35414f' }}>
                自分で入力
              </div>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 6l6 6-6 6"
                stroke="#35414f"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </Link>
      </div>
    </div>
  )
}
