// Load the word bank from data/words.json into MongoDB. Safe to re-run.
// Words are upserted by rank, so their ids (and everyone's progress) survive a re-seed.
require('dotenv').config({ quiet: true })
const mongoose = require('mongoose')
const { clientPromise } = require('../config/database')
const Word = require('../models/word')
const words = require('../data/words.json')

async function seed() {
  await clientPromise
  await Word.syncIndexes()
  const result = await Word.bulkWrite(words.map(word => ({
    updateOne: { filter: { rank: word.rank }, update: { $set: word }, upsert: true }
  })))
  console.log(`Seeded ${words.length} words (${result.upsertedCount} new, ${result.modifiedCount} updated).`)
}

seed()
  .catch(err => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => mongoose.disconnect())
