export default function Loading() {
  return (
    <div className="px-5 pt-8 animate-pulse">
      <div className="h-8 w-32 rounded-lg mb-6" style={{ background: 'rgba(0,0,0,0.08)' }} />
      <div className="h-40 rounded-2xl mb-5" style={{ background: 'rgba(0,0,0,0.06)' }} />
      <div className="h-20 rounded-2xl mb-5" style={{ background: 'rgba(0,0,0,0.06)' }} />
      <div className="h-16 rounded-2xl" style={{ background: 'rgba(0,0,0,0.06)' }} />
    </div>
  )
}
