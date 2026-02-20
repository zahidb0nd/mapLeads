export default function AnimatedBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden"
    >
      {/* Orb 1 — top left */}
      <div
        className="absolute animate-float1"
        style={{
          width: 'clamp(300px, 50vw, 600px)',
          height: 'clamp(300px, 50vw, 600px)',
          top: '-200px',
          left: '-200px',
          background: 'radial-gradient(circle, #7C3AED22, transparent 70%)',
          borderRadius: '50%',
        }}
      />
      {/* Orb 2 — bottom right */}
      <div
        className="absolute animate-float2"
        style={{
          width: 'clamp(200px, 33vw, 400px)',
          height: 'clamp(200px, 33vw, 400px)',
          bottom: '-100px',
          right: '-100px',
          background: 'radial-gradient(circle, #5B21B622, transparent 70%)',
          borderRadius: '50%',
        }}
      />
      {/* Orb 3 — center */}
      <div
        className="absolute animate-float3"
        style={{
          width: 'clamp(150px, 25vw, 300px)',
          height: 'clamp(150px, 25vw, 300px)',
          top: '50%',
          left: '50%',
          background: 'radial-gradient(circle, #9F67FF15, transparent 70%)',
          borderRadius: '50%',
        }}
      />
    </div>
  )
}
