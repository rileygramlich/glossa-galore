const createError = require('http-errors')
const languages = require('./languages')

// Make the signed-in user and a few helpers available to every view.
function locals(req, res, next) {
  res.locals.user = req.user || null
  res.locals.path = req.path
  res.locals.languages = languages.list
  // "Suggest a language" sends through EmailJS. These IDs are public by design;
  // the destination address lives in the EmailJS template, not here.
  const emailjs = {
    serviceId: (process.env.EMAILJS_SERVICE_ID || '').trim(),
    templateId: (process.env.EMAILJS_TEMPLATE_ID || '').trim(),
    publicKey: (process.env.EMAILJS_PUBLIC_KEY || '').trim()
  }
  res.locals.suggest = emailjs.serviceId && emailjs.templateId && emailjs.publicKey ? emailjs : null
  res.locals.formatDate = date => new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  next()
}

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next()
  if (req.accepts(['html', 'json']) === 'json') return next(createError(401))
  req.session.returnTo = req.originalUrl
  res.redirect('/login')
}

// router.param handler: 404 for any language we don't have translations for.
function loadLanguage(req, res, next, code) {
  const lang = languages.get(code)
  if (!lang) return next(createError(404))
  req.lang = lang
  res.locals.lang = lang
  next()
}

module.exports = { locals, isLoggedIn, loadLanguage }
