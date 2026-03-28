import { useState, useEffect, useRef } from 'react'

const EXAMPLE_VIBES = [
  'cozy rainy afternoon with tea',
  'late night hacker energy',
  'summer road trip, windows down',
  'melancholy Sunday morning',
  'neon-lit Tokyo alleyway',
]

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return { r, g, b }
}

function luminance({ r, g, b }) {
  return 0.299 * r + 0.587 * g + 0.114 * b
}

function SwatchCard({ color, index }) {
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
      className="relative flex flex-col justify-end rounded-2xl overflow-hidden cursor-pointer transition-transform hover:scale-[1.03] active:scale-[0.98]"
      style={{ backgroundColor: color.hex, minHeight: 160, animationDelay: `${index * 80}ms` }}
      onClick={copy}
      title="Click to copy hex"
    >
      <div
        className="p-3 flex flex-col gap-0.5"
        style={{ color: textColor }}
      >
        <span className="text-xs font-semibold uppercase tracking-widest opacity-70">{color.role}</span>
        <span className="text-sm font-bold">{color.name}</span>
        <span className="text-xs font-mono opacity-80">{color.hex}</span>
        {copied && (
          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold"
            style={{ backgroundColor: color.hex, color: textColor }}>
            Copied!
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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
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

  async function generate(e) {
    e.preventDefault()
    const query = vibe.trim() || placeholder
    if (!query) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/generate-palette', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vibe: query }),
      })
      if (!res.ok) throw new Error('Server error')
      const data = await res.json()
      setResult(data)
    } catch (err) {
      setError('Something went wrong. Make sure ANTHROPIC_API_KEY is set in .env')
    } finally {
      setLoading(false)
    }
  }

  const bgColor = result?.palette?.find(p => p.role === 'background')?.hex
  const primaryFont = result?.fonts?.heading

  return (
    <div
      className="min-h-screen flex flex-col items-center px-4 py-16 transition-colors duration-700"
      style={bgColor ? { backgroundColor: bgColor } : {}}
    >
      {result?.fonts && (
        <GoogleFontLoader heading={result.fonts.heading} body={result.fonts.body} />
      )}

      {/* Header */}
      <div className="text-center mb-12">
        <h1
          className="text-5xl font-black tracking-tight mb-2 transition-all duration-500"
          style={primaryFont ? { fontFamily: `'${primaryFont}', sans-serif` } : {}}
        >
          {result ? `${result.emojis} ${result.aesthetic_name}` : '✨ Vibe Palette'}
        </h1>
        <p className="text-base opacity-60 mt-2">
          {result?.descriptor ?? 'Describe a mood. Get a palette.'}
        </p>
      </div>

      {/* Input */}
      <form onSubmit={generate} className="w-full max-w-xl flex gap-2 mb-12">
        <input
          ref={inputRef}
          type="text"
          value={vibe}
          onChange={e => setVibe(e.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded-xl px-4 py-3 text-base bg-white/10 border border-white/20 backdrop-blur-sm placeholder:opacity-40 focus:outline-none focus:border-white/50 transition"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-3 rounded-xl font-semibold text-sm bg-white/20 border border-white/30 hover:bg-white/30 disabled:opacity-40 transition backdrop-blur-sm"
        >
          {loading ? '...' : 'Generate'}
        </button>
      </form>

      {/* Loading */}
      {loading && (
        <div className="flex gap-2 mb-10">
          {[0, 1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="w-12 h-24 rounded-xl bg-white/10 animate-pulse"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-8 px-4 py-3 rounded-xl bg-red-500/20 border border-red-400/30 text-red-300 text-sm max-w-md text-center">
          {error}
        </div>
      )}

      {/* Palette */}
      {result && (
        <div className="w-full max-w-2xl">
          <div className="grid grid-cols-5 gap-3 mb-8">
            {result.palette.map((color, i) => (
              <SwatchCard key={color.hex} color={color} index={i} />
            ))}
          </div>

          {/* Font info */}
          <div className="flex gap-4 justify-center flex-wrap">
            <div className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-sm backdrop-blur-sm">
              <span className="opacity-50 text-xs uppercase tracking-wider mr-2">Heading</span>
              <span style={{ fontFamily: `'${result.fonts.heading}', sans-serif` }}>
                {result.fonts.heading}
              </span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-sm backdrop-blur-sm">
              <span className="opacity-50 text-xs uppercase tracking-wider mr-2">Body</span>
              <span style={{ fontFamily: `'${result.fonts.body}', sans-serif` }}>
                {result.fonts.body}
              </span>
            </div>
          </div>

          {/* Try again */}
          <div className="mt-8 text-center">
            <button
              onClick={() => { setResult(null); setVibe(''); inputRef.current?.focus() }}
              className="text-sm opacity-50 hover:opacity-80 transition underline underline-offset-4"
            >
              Try another vibe
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
