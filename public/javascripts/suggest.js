// "Suggest a language": a small popup that saves the suggestion through POST /suggest.
(() => {
  const dialog = document.querySelector('[data-suggest]')
  if (!dialog) return
  const form = dialog.querySelector('[data-suggest-form]')
  const status = dialog.querySelector('[data-suggest-status]')
  const send = dialog.querySelector('[data-suggest-send]')

  const open = () => {
    status.textContent = ''
    status.className = 'suggest__status small'
    dialog.showModal()
    form.language.focus()
  }
  document.querySelectorAll('[data-suggest-open]').forEach(b => b.addEventListener('click', open))
  dialog.querySelectorAll('[data-suggest-close]').forEach(b => b.addEventListener('click', () => dialog.close()))
  // A click on the dimmed backdrop closes it too.
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close() })

  const say = (text, kind) => {
    status.textContent = text
    status.className = `suggest__status small suggest__status--${kind}`
  }

  form.addEventListener('submit', async e => {
    e.preventDefault()
    const language = form.language.value.trim()
    if (!language) return form.language.focus()

    send.disabled = true
    say('Sending…', 'pending')
    try {
      const res = await fetch('/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          language,
          message: form.message.value,
          reply_to: form.reply_to.value,
          page: location.pathname,
          website: form.website.value
        })
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || res.statusText)
      say(`Thanks! We'll look into adding ${language}.`, 'ok')
      form.reset()
      setTimeout(() => dialog.open && dialog.close(), 2200)
    } catch (err) {
      console.error('Suggestion not sent:', err)
      say(err.message && !/fetch/i.test(err.message) ? err.message : "That didn't send. Please try again in a moment.", 'error')
    } finally {
      send.disabled = false
    }
  })
})()
