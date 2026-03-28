import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import Anthropic from '@anthropic-ai/sdk'

const app = express()
app.use(cors())
app.use(express.json())

const client = new Anthropic()

app.post('/api/generate-palette', async (req, res) => {
  const { vibe } = req.body
  if (!vibe || typeof vibe !== 'string' || vibe.trim().length === 0) {
    return res.status(400).json({ error: 'vibe is required' })
  }

  const prompt = `You are a creative color and aesthetic designer. Given a mood or vibe description, generate a matching visual aesthetic.

Vibe: "${vibe.trim()}"

Respond with ONLY valid JSON (no markdown, no explanation) in this exact shape:
{
  "aesthetic_name": "2-4 word aesthetic label (e.g. 'Cottagecore Dusk', 'Neon Noir')",
  "descriptor": "One evocative sentence describing this aesthetic",
  "emojis": "1-3 relevant emojis",
  "palette": [
    { "name": "color name", "hex": "#RRGGBB", "role": "background|surface|primary|accent|text" },
    { "name": "color name", "hex": "#RRGGBB", "role": "background|surface|primary|accent|text" },
    { "name": "color name", "hex": "#RRGGBB", "role": "background|surface|primary|accent|text" },
    { "name": "color name", "hex": "#RRGGBB", "role": "background|surface|primary|accent|text" },
    { "name": "color name", "hex": "#RRGGBB", "role": "background|surface|primary|accent|text" }
  ],
  "fonts": {
    "heading": "Google Font name for headings",
    "body": "Google Font name for body text"
  }
}`

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].text
    const data = JSON.parse(text)
    res.json(data)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to generate palette' })
  }
})

app.listen(3001, () => console.log('API server running on :3001'))
