export default function Loading() {
  return (
    <div className="px-5 pt-8 animate-pulse">
      <div className="h-8 w-24 rounded-lg mb-6" style={{ background: 'rgba(0,0,0,0.08)' }} />
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 rounded-2xl" style={{ background: 'rgba(0,0,0,0.06)' }} />
        ))}
      </div>
    </div>
  )
}
