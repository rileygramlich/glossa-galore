const Word = require('../models/word')
const words = require('../data/words.json')

// Load the word bank from data/words.json. Safe to re-run: words are upserted by
// rank, so their ids (and everyone's progress) survive a re-seed.
async function seedWords() {
  await Word.syncIndexes()
  const result = await Word.bulkWrite(words.map(word => ({
    updateOne: { filter: { rank: word.rank }, update: { $set: word }, upsert: true }
  })))
  return { total: words.length, added: result.upsertedCount, updated: result.modifiedCount }
}

// On startup: seed an empty database, so a fresh deploy works without a manual step.
async function ensureWords() {
  if (await Word.estimatedDocumentCount() > 0) return
  const { added } = await seedWords()
  console.log(`Word bank was empty: loaded ${added} words.`)
}

module.exports = { seedWords, ensureWords }
