// Flashcard trainer. Signed-in progress is saved to the account; guest progress lives in
// localStorage and is moved into the account on the first visit after signing in.
(() => {
  const state = JSON.parse(document.getElementById('learn-state').textContent)
  const { lang, signedIn, total } = state

  const $ = selector => document.querySelector(selector)
  const $$ = selector => [...document.querySelectorAll(selector)]

  const card = $('[data-card]')
  const stage = $('[data-stage]')
  const markButtons = $$('[data-mark]')
  const SWIPE_DISTANCE = 90

  // ---------- Guest storage ----------

  const storageKey = code => `glossa:progress:${code}`

  function readGuest(code) {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey(code)))
      if (saved && Array.isArray(saved.known) && Array.isArray(saved.learning)) return saved
    } catch {}
    return { known: [], learning: [] }
  }

  function writeGuest() {
    try {
      localStorage.setItem(storageKey(lang), JSON.stringify({ known: progress.known, learning: progress.learning }))
    } catch {}
  }

  // ---------- State ----------

  const progress = signedIn
    ? { known: state.known, learning: state.learning }
    : readGuest(lang)
  const knownRanks = () => new Set(progress.known.map(c => c.rank))

  let queue = state.deck.filter(c => !knownRanks().has(c.rank))
  const seen = []
  let current = null
  let busy = false

  // ---------- Server ----------

  async function api(method, url, body) {
    const res = await fetch(url, {
      method,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'same-origin'
    })
    if (res.status === 401) {
      location.href = '/login'
      throw new Error('Signed out')
    }
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || res.statusText)
    return res.json()
  }

  async function refill() {
    const exclude = [...(signedIn ? [] : knownRanks()), ...seen.slice(-200), ...queue.map(c => c.rank)]
    const { deck } = await api('GET', `/learn/${lang}/deck?exclude=${exclude.join(',')}`)
    queue.push(...deck.filter(c => !knownRanks().has(c.rank)))
  }

  // Move any guest progress into the account, then reload to show the merged lists.
  async function syncGuestProgress() {
    let addedHere = 0
    for (const code of state.languages) {
      const saved = readGuest(code)
      if (!saved.known.length && !saved.learning.length) continue
      try {
        const { added } = await api('POST', `/learn/${code}/sync`, {
          known: saved.known.map(c => c.rank),
          learning: saved.learning.map(c => c.rank)
        })
        localStorage.removeItem(storageKey(code))
        if (code === lang) addedHere = added
      } catch {}
    }
    if (addedHere) location.reload()
  }

  // ---------- Rendering ----------

  function showCard(next) {
    current = next
    card.classList.remove('is-flipped')
    if (!current) {
      card.hidden = true
      stage.classList.add('is-empty')
      $('[data-done]').hidden = false
      markButtons.forEach(b => (b.disabled = true))
      return
    }
    $('[data-front]').textContent = current.word
    $('[data-back]').textContent = current.en
    $('[data-original]').textContent = current.word
    $('[data-rank]').textContent = `#${current.rank}`
    card.setAttribute('aria-label', `${current.word}. Press Space to see the English.`)
    card.classList.remove('enter')
    void card.offsetWidth
    card.classList.add('enter')
  }

  function renderLists(newRank) {
    for (const status of ['known', 'learning']) {
      const list = $(`[data-list="${status}"]`)
      list.replaceChildren(...progress[status].map(c => listItem(c, status, c.rank === newRank)))
      $$(`[data-count="${status}"]`).forEach(el => (el.textContent = progress[status].length))
    }
    $('[data-meter] .meter__fill').style.setProperty('--value', `${(progress.known.length / total) * 100}%`)
  }

  function listItem(c, status, isNew) {
    const li = document.createElement('li')
    if (isNew) li.className = 'is-new'
    const word = document.createElement('span')
    word.className = 'word-list__word'
    word.lang = lang
    word.textContent = c.word
    const en = document.createElement('span')
    en.className = 'word-list__en'
    en.textContent = c.en
    const remove = document.createElement('button')
    remove.type = 'button'
    remove.className = 'word-list__remove'
    remove.textContent = '×'
    remove.title = 'Remove from this list'
    remove.setAttribute('aria-label', `Remove ${c.word} from the list`)
    remove.addEventListener('click', () => removeWord(c, status))
    li.append(word, en, remove)
    return li
  }

  function announce(message) {
    $('[data-announce]').textContent = message
  }

  let toastTimer
  function toast(message) {
    const el = $('[data-toast]')
    el.textContent = message
    el.hidden = false
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => (el.hidden = true), 3500)
  }

  function selectTab(status) {
    $$('[data-tab]').forEach(tab => tab.setAttribute('aria-selected', String(tab.dataset.tab === status)))
    $$('[data-panel]').forEach(panel => (panel.hidden = panel.dataset.panel !== status))
  }

  // ---------- Actions ----------

  function applyLocally(c, status) {
    progress.known = progress.known.filter(w => w.rank !== c.rank)
    progress.learning = progress.learning.filter(w => w.rank !== c.rank)
    if (status) progress[status].unshift(c)
    if (!signedIn) writeGuest()
  }

  async function mark(status) {
    if (!current || busy) return
    busy = true
    const c = current
    const previous = { known: [...progress.known], learning: [...progress.learning] }

    card.classList.add(`fly-${status}`)
    applyLocally(c, status)
    renderLists(c.rank)
    announce(`${c.word}: ${status === 'known' ? 'marked as known' : 'still learning'}.`)
    seen.push(c.rank)

    const saving = signedIn
      ? api('POST', `/learn/${lang}/words/${c.id}`, { status }).catch(err => {
          progress.known = previous.known
          progress.learning = previous.learning
          renderLists()
          toast(`Couldn't save "${c.word}". ${err.message}`)
        })
      : Promise.resolve()

    // Learning words come back around later in the session.
    if (status === 'learning') queue.splice(Math.min(queue.length, 6 + Math.floor(Math.random() * 6)), 0, c)

    await wait(260)
    resetCardPosition()
    if (queue.length < 4) await refill().catch(() => toast('Couldn\'t load more words. Check your connection.'))
    showCard(queue.shift() || null)
    busy = false
    await saving
  }

  async function removeWord(c, status) {
    const previous = { known: [...progress.known], learning: [...progress.learning] }
    applyLocally(c, null)
    renderLists()
    announce(`${c.word} removed from the list.`)
    if (signedIn) {
      try {
        await api('DELETE', `/learn/${lang}/words/${c.id}`)
      } catch (err) {
        Object.assign(progress, previous)
        renderLists()
        toast(`Couldn't remove "${c.word}". ${err.message}`)
        return
      }
    }
    // The deck was finished, but a word just left the known list: deal it back in.
    if (status === 'known' && !current) {
      $('[data-done]').hidden = true
      stage.classList.remove('is-empty')
      card.hidden = false
      markButtons.forEach(b => (b.disabled = false))
      await refill().catch(() => {})
      showCard(queue.shift() || null)
    }
  }

  function flip() {
    if (current) card.classList.toggle('is-flipped')
  }

  const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

  // ---------- Dragging ----------

  let drag = null

  function setDrag(dx) {
    card.style.setProperty('--drag', `${dx}px`)
    card.style.setProperty('--tilt', `${dx / 22}deg`)
    const lean = Math.min(Math.abs(dx) / SWIPE_DISTANCE, 1)
    card.style.setProperty('--lean', lean)
    card.classList.toggle('leaning-known', dx > 10)
    card.classList.toggle('leaning-learning', dx < -10)
  }

  function resetCardPosition() {
    card.classList.add('is-dragging')
    card.classList.remove('fly-known', 'fly-learning')
    setDrag(0)
    void card.offsetWidth
    card.classList.remove('is-dragging')
  }

  card.addEventListener('pointerdown', e => {
    if (busy || !current || e.button > 0) return
    drag = { x: e.clientX, y: e.clientY, dx: 0, moved: false, id: e.pointerId }
  })

  card.addEventListener('pointermove', e => {
    if (!drag || e.pointerId !== drag.id) return
    const dx = e.clientX - drag.x
    const dy = e.clientY - drag.y
    if (!drag.moved) {
      if (Math.abs(dx) < 8 || Math.abs(dy) > Math.abs(dx)) return
      drag.moved = true
      card.setPointerCapture(e.pointerId)
      card.classList.add('is-dragging')
    }
    drag.dx = dx
    setDrag(dx)
  })

  function endDrag(e) {
    if (!drag || e.pointerId !== drag.id) return
    const { moved, dx } = drag
    drag = null
    card.classList.remove('is-dragging', 'leaning-known', 'leaning-learning')
    if (!moved) {
      if (e.type === 'pointerup') flip()
      return
    }
    if (Math.abs(dx) >= SWIPE_DISTANCE) mark(dx > 0 ? 'known' : 'learning')
    else setDrag(0)
  }

  card.addEventListener('pointerup', endDrag)
  card.addEventListener('pointercancel', endDrag)

  // ---------- Wiring ----------

  card.addEventListener('keydown', e => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      flip()
    }
  })

  document.addEventListener('keydown', e => {
    if (e.altKey || e.ctrlKey || e.metaKey || e.target.closest('input, textarea, button')) return
    if (e.key === 'ArrowRight') mark('known')
    else if (e.key === 'ArrowLeft') mark('learning')
    else if (e.key === ' ' && e.target === document.body) {
      e.preventDefault()
      flip()
    }
  })

  markButtons.forEach(button => button.addEventListener('click', () => mark(button.dataset.mark)))
  $$('[data-tab]').forEach(tab => tab.addEventListener('click', () => selectTab(tab.dataset.tab)))

  renderLists()
  if (queue.length) showCard(queue.shift())
  else refill().then(() => showCard(queue.shift() || null), () => showCard(null))
  if (signedIn) syncGuestProgress()
})()
