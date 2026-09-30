const crypto = require('crypto')
const createError = require('http-errors')
const Suggestion = require('../models/suggestion')
const { requireDatabase } = require('../config/database')

// A public, unauthenticated write, so it's treated as hostile input: bounded
// fields, a honeypot, and a per-sender rate limit that works across instances.
const RATE_LIMIT = 5
const RATE_WINDOW_MS = 10 * 60 * 1000

module.exports = { create }

// POST /suggest  { language, message?, reply_to?, page?, website? }
async function create(req, res) {
  const body = req.body || {}
  // Bots fill in the hidden "website" field. Say thanks and store nothing.
  if (body.website) return res.json({ ok: true })

  const language = clean(body.language, 60)
  if (!language) throw createError(400, 'Which language would you like to see?')

  await requireDatabase()
  const sender = hash(req.ip)
  const recent = await Suggestion.countDocuments({ sender, createdAt: { $gt: new Date(Date.now() - RATE_WINDOW_MS) } })
  if (recent >= RATE_LIMIT) throw createError(429, "That's a lot of suggestions. Please try again in a few minutes.")

  await Suggestion.create({
    language,
    message: clean(body.message, 1000),
    replyTo: clean(body.reply_to, 120),
    page: clean(body.page, 300),
    user: req.user ? req.user._id : undefined,
    sender
  })
  res.status(201).json({ ok: true })
}

function clean(value, max) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function hash(ip) {
  return crypto.createHash('sha256').update(`${process.env.SESSION_SECRET || 'glossa'}:${ip}`).digest('hex').slice(0, 32)
}
