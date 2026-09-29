const Word = require('../models/word')
const { codes } = require('../config/languages')

const DECK_SIZE = 20

module.exports = {
  languages,
  index,
  deck
}

function languages(req, res) {
  res.render('learn/languages', {
    stats: req.user ? req.user.stats() : null
  })
}

async function index(req, res) {
  const lang = req.lang.code
  const total = await Word.estimatedDocumentCount()
  const progress = { known: [], learning: [] }

  if (req.user) {
    // Newest first, so the words you just marked sit at the top of each list.
    const entries = req.user.vocabFor(lang).sort((a, b) => b.updatedAt - a.updatedAt)
    const words = await Word.find({ _id: { $in: entries.map(e => e.word) } })
    const byId = new Map(words.map(w => [w.id, w]))
    entries.forEach(e => {
      const word = byId.get(e.word.toString())
      if (word) progress[e.status].push(word.toCard(lang))
    })
  }

  res.render('learn/index', {
    state: {
      lang,
      languages: codes,
      signedIn: Boolean(req.user),
      total,
      deck: await drawDeck(lang, req.user ? req.user.knownIds(lang) : []),
      ...progress
    }
  })
}

// GET /learn/:lang/deck?exclude=1,2,3 -> a fresh shuffled batch of cards.
// `exclude` holds word ranks (a guest's known words, plus cards just seen).
async function deck(req, res) {
  const lang = req.lang.code
  const excludeRanks = String(req.query.exclude || '')
    .split(',')
    .map(Number)
    .filter(Number.isInteger)
    .slice(0, 2000)
  const excludeIds = req.user ? req.user.knownIds(lang) : []
  res.json({ deck: await drawDeck(lang, excludeIds, excludeRanks) })
}

async function drawDeck(lang, excludeIds = [], excludeRanks = []) {
  const words = await Word.aggregate([
    { $match: { _id: { $nin: excludeIds }, rank: { $nin: excludeRanks } } },
    { $sample: { size: DECK_SIZE } }
  ])
  return words.map(w => Word.hydrate(w).toCard(lang))
}
