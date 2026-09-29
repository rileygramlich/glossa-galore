// Languages the word bank has translations for. Each code is also a field on the Word model.
const languages = {
  fr: { code: 'fr', name: 'French', native: 'Français', hello: 'Bonjour' },
  pt: { code: 'pt', name: 'Portuguese', native: 'Português', hello: 'Olá' },
  de: { code: 'de', name: 'German', native: 'Deutsch', hello: 'Hallo' }
}

module.exports = {
  languages,
  list: Object.values(languages),
  codes: Object.keys(languages),
  get: code => languages[code]
}
