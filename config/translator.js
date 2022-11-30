// const token = '7883edd0-4b28-ed01-f870-44b73a3120d5:fx'
const deepl = require('deepl-node')
const topWords = require('./top1000')

module.exports = {
    translate
}

console.log(token)

const authKey = token
const translator = new deepl.Translator(authKey)

async function test() {
    const result = await translator.translateText('Hello, world!', null, 'fr');
    console.log(result.text)    
}

async function translate(eng) {
    const result = await translator.translateText(eng, null, 'fr')
    console.log(result.text)
    return result.text
}

translate('My name is Riley')

test()

// (async () => {
// })()

// (async () => {
//     const result = await translator.translateText(topWords, null, 'fr');
//     console.log(result.text)
// })();