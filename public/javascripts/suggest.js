// "Suggest a language": a small popup that emails the suggestion through EmailJS's REST API.
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
    if (form.website.value) return dialog.close() // a bot filled in the hidden field
    const language = form.language.value.trim()
    if (!language) return form.language.focus()

    send.disabled = true
    say('Sending…', 'pending')
    try {
      const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: form.dataset.service,
          template_id: form.dataset.template,
          user_id: form.dataset.key,
          template_params: {
            language,
            message: form.message.value.trim() || '(no message)',
            reply_to: form.reply_to.value.trim() || '(not given)',
            page: location.href
          }
        })
      })
      if (!res.ok) throw new Error(await res.text())
      say(`Thanks! We'll look into adding ${language}.`, 'ok')
      form.reset()
      setTimeout(() => dialog.open && dialog.close(), 2200)
    } catch (err) {
      console.error('Suggestion not sent:', err)
      say("That didn't send. Please try again in a moment.", 'error')
    } finally {
      send.disabled = false
    }
  })
})()
