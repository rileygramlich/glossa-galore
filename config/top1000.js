const {readFileSync, promises: fsPromises} = require('fs');
// const tr = require('./translator')
const token = process.env.DEEPL_TOKEN
const deepl = require('deepl-node')
const authKey = token
const translator = new deepl.Translator(authKey)
require('./database')
const Word = require('../models/word');

// require the model


// convert .txt to js array
function syncReadFile(filename) {
  const contents = readFileSync(filename, 'utf-8')
  const arr = contents.split(/\r?\n/)
  return arr
}

const words = syncReadFile(require('path').resolve(__dirname, '../public/docs/1000.txt'))
const top100 = words.slice(0, 101)


let wordsDB = []

async function getFrWords() {
  const translations = await translator.translateText(
    top100,
    'en',
    'fr',
  )
  console.log(translations)
  for (let i = 0; i<top100.length; i++) {
    wordsDB.push({rank: i+1, en: top100[i], fr: translations[i].text})
  }
  return wordsDB
}

Word.deleteMany({})
  .then(result => {
    return getFrWords()
  })
  .then(wordsDB => {
    return Word.create(wordsDB)
  })
  .then(result => console.log(result))


// getFrWords()
//   .then(wordsDB => {})


// console.log(test())

// async function getDeWords() {
//   const translations = await translator.translateText(
//     top100,
//     'en',
//     'de',
//     )
//     console.log(translations)
//     for (let i = 0; i<top100.length-1; i++) {
//       console.log(wordsDB[i])
//       wordsDB[i].de = translations[i].text
//   }
//   console.log(wordsDB)
//   return wordsDB
// }

// async function test() {
//   let wordsDB = await getFrWords()
//   let newDB = await getDeWords(wordsDB)
//   return newDB
// }



// let's test the imported translator here, before adding to words schema db

module.exports = {
  words
}
// loop over the array, put into object pairs for language, and translate it here,
// an 