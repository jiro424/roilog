type Props = {
  size?: number
  withTagline?: boolean
  color?: string
  tagColor?: string
}

export default function Logo({
  size = 56,
  withTagline = false,
  color = '#005ba0',
  tagColor = '#9ca3af',
}: Props) {
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      <span
        style={{
          fontFamily: 'var(--font-bebas), "Hiragino Kaku Gothic Pro", sans-serif',
          fontSize: size,
          letterSpacing: size * 0.08,
          color,
          lineHeight: 1,
        }}
      >
        ROILOG
      </span>
      {withTagline && (
        <span
          style={{
            fontFamily: 'var(--font-outfit), sans-serif',
            fontSize: size * 0.16,
            letterSpacing: size * 0.05,
            color: tagColor,
            marginTop: size * 0.1,
            fontWeight: 500,
          }}
        >
          TOURNAMENT ROI TRACKER
        </span>
      )}
    </div>
  )
}
