// Load (or refresh) the word bank from data/words.json. Safe to re-run.
// The app also does this on its own at startup when the database is empty.
require('dotenv').config({ quiet: true })
const mongoose = require('mongoose')
const { ensureConnected } = require('../config/database')
const { seedWords } = require('../config/words')

async function seed() {
  await ensureConnected()
  const { total, added, updated } = await seedWords()
  console.log(`Seeded ${total} words (${added} new, ${updated} updated).`)
}

seed()
  .catch(err => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => mongoose.disconnect())
