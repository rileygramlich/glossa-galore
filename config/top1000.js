const {readFileSync, promises: fsPromises} = require('fs');
// const tr = require('./translator')
const token = '7883edd0-4b28-ed01-f870-44b73a3120d5:fx' // process.env.DEEPL_TOKEN
const deepl = require('deepl-node')
const authKey = token
const translator = new deepl.Translator(authKey)


// convert .txt to js array
function syncReadFile(filename) {
  const contents = readFileSync(filename, 'utf-8')
  const arr = contents.split(/\r?\n/)
  return arr
}

const words = syncReadFile(require('path').resolve(__dirname, '../public/docs/1000.txt'))
const top100 = words.slice(0, 101)

async function translateToFr(eng) {
  const result = await translator.translateText(eng, null, 'fr')
  console.log(result.text)
  return result.text
}

async function translateWordsToFr() {
    let translations = []
    console.log
    let i = 0
     top100.map(async word => {
      console.log(word)
      let frWord = await translateToFr(word)
      console.log(frWord)
      translations.push({rank: i, en: word, fr: frWord})
      })
      i++
      console.log(translations)
      return translations
    }
    
// console.log(translateWordsToFr())


async function getFrWords() {
  const translations = await translator.translateText(
    top100,
    'en',
    'fr',
  )
  console.log(translations)
  return translations
}

console.log(getFrWords())

let frWords = getFrWords()

// console.log(`Second word: ${frWords[1].text}`)

function makeWordsDB() {
  let translations = []
  for (let i = 0; i<top100.length-1; i++) {
    translations.push({rank: i+1, en: top100[i], fr: frWords[i]})
  }
  console.log(translations)
}

// makeWordsDB()
    
    // let's test the imported translator here, before adding to words schema db
    
    module.exports = {
      words
    }
// loop over the array, put into object pairs for language, and translate it here,
// an 