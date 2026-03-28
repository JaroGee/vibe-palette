import { useState, useEffect, useRef } from 'react'
import { matchPalette } from './palettes'

const EXAMPLE_VIBES = [
  'cozy rainy afternoon with tea',
  'late night hacker energy',
  'summer road trip, windows down',
  'melancholy Sunday morning',
  'neon-lit Tokyo alleyway',
]

const STARS = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  top: Math.random() * 60,
  left: Math.random() * 100,
  size: Math.random() * 2 + 1,
  delay: Math.random() * 3,
}))

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return { r, g, b }
}

function luminance({ r, g, b }) {
  return 0.299 * r + 0.587 * g + 0.114 * b
}

function SwatchCard({ color }) {
  const [copied, setCopied] = useState(false)
  const rgb = hexToRgb(color.hex)
  const light = luminance(rgb) > 128
  const textColor = light ? '#1a1a1a' : '#f5f5f5'

  function copy() {
    navigator.clipboard.writeText(color.hex)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div
      className="swatch-card relative flex flex-col justify-end rounded-xl overflow-hidden cursor-pointer"
      style={{ backgroundColor: color.hex, minHeight: 140 }}
      onClick={copy}
      title="Click to copy hex"
    >
      <div className="p-3 flex flex-col gap-0.5" style={{ color: textColor }}>
        <span className="text-xs font-semibold uppercase tracking-widest opacity-60">{color.role}</span>
        <span className="text-sm font-bold">{color.name}</span>
        <span className="text-xs font-mono opacity-70">{color.hex}</span>
        {copied && (
          <span
            className="absolute inset-0 flex items-center justify-center text-sm font-bold"
            style={{ backgroundColor: color.hex, color: textColor }}
          >
            COPIED
          </span>
        )}
      </div>
    </div>
  )
}

function GoogleFontLoader({ heading, body }) {
  useEffect(() => {
    if (!heading && !body) return
    const families = [heading, body]
      .filter(Boolean)
      .map(f => f.replace(/ /g, '+'))
      .join('&family=')
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = `https://fonts.googleapis.com/css2?family=${families}&display=swap`
    document.head.appendChild(link)
    return () => document.head.removeChild(link)
  }, [heading, body])
  return null
}

export default function App() {
  const [vibe, setVibe] = useState('')
  const [result, setResult] = useState(null)
  const [placeholder, setPlaceholder] = useState(EXAMPLE_VIBES[0])
  const inputRef = useRef()

  useEffect(() => {
    let i = 0
    const id = setInterval(() => {
      i = (i + 1) % EXAMPLE_VIBES.length
      setPlaceholder(EXAMPLE_VIBES[i])
    }, 3000)
    return () => clearInterval(id)
  }, [])

  function generate(e) {
    e.preventDefault()
    const query = vibe.trim() || placeholder
    setResult(matchPalette(query))
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Stars */}
      {STARS.map(s => (
        <div
          key={s.id}
          className="star"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}

      {result?.fonts && (
        <GoogleFontLoader heading={result.fonts.heading} body={result.fonts.body} />
      )}

      {/* Title */}
      <div className="text-center mb-10">
        <div className="text-xs tracking-[0.4em] text-pink-400 mb-3 neon-cyan" style={{ fontFamily: 'Orbitron, sans-serif' }}>
          ★ ARCADE COLOR SYSTEM ★
        </div>
        <h1 className="neon-title text-5xl md:text-6xl font-black mb-3">
          {result ? `${result.emojis} ${result.aesthetic_name}` : 'VIBE PALETTE'}
        </h1>
        <p className="text-sm opacity-50 tracking-wide" style={{ fontFamily: 'Exo 2, sans-serif' }}>
          {result?.descriptor ?? 'INSERT VIBE TO CONTINUE'}
        </p>
      </div>

      {/* Input */}
      <form onSubmit={generate} className="w-full max-w-lg flex gap-3 mb-10">
        <input
          ref={inputRef}
          type="text"
          value={vibe}
          onChange={e => setVibe(e.target.value)}
          placeholder={placeholder}
          className="neon-border flex-1 rounded-lg px-4 py-3 text-sm bg-black/50 backdrop-blur-sm placeholder:opacity-30 focus:outline-none transition"
          style={{ fontFamily: 'Exo 2, sans-serif' }}
        />
        <button type="submit" className="neon-btn px-5 py-3 rounded-lg">
          GENERATE
        </button>
      </form>

      {/* Palette */}
      {result && (
        <div className="w-full max-w-2xl">
          <div className="grid grid-cols-5 gap-3 mb-6">
            {result.palette.map(color => (
              <SwatchCard key={color.hex} color={color} />
            ))}
          </div>

          {/* Font tags */}
          <div className="flex gap-3 justify-center flex-wrap mb-8">
            <div className="font-tag px-3 py-1.5 rounded-md">
              HEADING / {result.fonts.heading}
            </div>
            <div className="font-tag px-3 py-1.5 rounded-md">
              BODY / {result.fonts.body}
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => { setResult(null); setVibe(''); inputRef.current?.focus() }}
              className="text-xs tracking-widest opacity-40 hover:opacity-80 transition"
              style={{ fontFamily: 'Orbitron, sans-serif' }}
            >
              ← TRY ANOTHER VIBE
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
