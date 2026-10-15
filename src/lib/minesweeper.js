// Minesweeper's rules, a little confetti and the sound. Nothing here touches React.

export const LEVELS = {
  beginner: { size: 9, bugs: 10 },
  intermediate: { size: 12, bugs: 24 },
  expert: { size: 15, bugs: 45 },
}
export const LEVEL_IDS = Object.keys(LEVELS)

export function neighbours(i, size) {
  const r = Math.floor(i / size)
  const c = i % size
  const out = []
  for (let dr = -1; dr <= 1; dr++)
    for (let dc = -1; dc <= 1; dc++) {
      const nr = r + dr
      const nc = c + dc
      if ((dr || dc) && nr >= 0 && nc >= 0 && nr < size && nc < size) out.push(nr * size + nc)
    }
  return out
}

// `wave` is how many steps from the click a cell opened, so the reveal can ripple outwards
export const empty = (size) =>
  Array.from({ length: size * size }, () => ({ bug: false, count: 0, open: false, flag: false, wave: 0 }))

// Bugs are placed on the first click, away from it, so the opening move is always safe
// (and, on every level, opens an area rather than a lone number)
export function plant(cells, safe, size, bugs) {
  const keepClear = new Set([safe, ...neighbours(safe, size)])
  const spots = cells.map((_, i) => i).filter((i) => !keepClear.has(i))
  for (let n = 0; n < bugs && spots.length; n++) {
    const pick = Math.floor(Math.random() * spots.length)
    cells[spots[pick]].bug = true
    spots.splice(pick, 1)
  }
  cells.forEach((cell, i) => (cell.count = neighbours(i, size).filter((j) => cells[j].bug).length))
}

// Opens a cell and spreads through every empty area it touches, breadth first so
// each cell knows how far from the click it is. Returns how many cells opened
export function flood(cells, start, size) {
  const queue = [[start, 0]]
  let opened = 0
  for (let k = 0; k < queue.length; k++) {
    const [i, steps] = queue[k]
    const cell = cells[i]
    if (cell.open || cell.flag) continue
    cell.open = true
    cell.wave = steps
    opened++
    if (!cell.bug && cell.count === 0)
      for (const j of neighbours(i, size)) if (!cells[j].open && !cells[j].flag) queue.push([j, steps + 1])
  }
  return opened
}

// After a loss every bug shows, rippling out from the one that was hit
export function exposeBugs(cells, hit, size) {
  const hr = Math.floor(hit / size)
  const hc = hit % size
  cells.forEach((cell, i) => {
    if (!cell.bug || cell.flag) return
    cell.open = true
    cell.wave = Math.max(Math.abs(Math.floor(i / size) - hr), Math.abs((i % size) - hc))
  })
}

export const isCleared = (cells) => cells.every((c) => c.bug || c.open)
export const flaggedRight = (cells) => cells.filter((c) => c.bug && c.flag).length

/* ---------- Sound ---------- */

// Tiny synthesised blips; no audio files to download. Each note is [frequency, start, length] in Hz and seconds
const SOUNDS = {
  open: { wave: 'sine', gain: 0.05, notes: [[520, 0, 0.06]] },
  spread: { wave: 'sine', gain: 0.05, notes: [[440, 0, 0.06], [587, 0.04, 0.06], [784, 0.08, 0.1]] },
  flag: { wave: 'triangle', gain: 0.06, notes: [[880, 0, 0.05], [1175, 0.035, 0.07]] },
  unflag: { wave: 'triangle', gain: 0.05, notes: [[700, 0, 0.05], [520, 0.035, 0.07]] },
  boom: { wave: 'sawtooth', gain: 0.045, notes: [[180, 0, 0.18], [110, 0.12, 0.35]] },
  win: { wave: 'triangle', gain: 0.06, notes: [[523, 0, 0.1], [659, 0.09, 0.1], [784, 0.18, 0.22]] },
  record: { wave: 'triangle', gain: 0.06, notes: [[523, 0, 0.1], [659, 0.1, 0.1], [784, 0.2, 0.1], [1047, 0.3, 0.35]] },
}

let audio

export function sound(name) {
  try {
    audio ??= new (window.AudioContext || window.webkitAudioContext)()
    if (audio.state === 'suspended') audio.resume()
    if (!name) return // just waking the audio up during a click, as browsers require
    const { wave, gain: peak, notes } = SOUNDS[name]
    const t0 = audio.currentTime + 0.01
    for (const [freq, at, len] of notes) {
      const osc = audio.createOscillator()
      const gain = audio.createGain()
      osc.type = wave
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.0001, t0 + at)
      gain.gain.exponentialRampToValueAtTime(peak, t0 + at + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + at + len)
      osc.connect(gain).connect(audio.destination)
      osc.start(t0 + at)
      osc.stop(t0 + at + len + 0.03)
    }
  } catch {
    // No Web Audio — the game just stays quiet
  }
}

/* ---------- Confetti ---------- */

// A short burst of paper over the board for a new record. Runs its own animation
// frames and stops once the last piece has fallen
export function confetti(canvas) {
  const ctx = canvas?.getContext('2d')
  if (!ctx) return () => {}
  const css = getComputedStyle(document.documentElement)
  const colors = ['--color-accent', '--color-accent-soft', '--color-fg'].map((v) => css.getPropertyValue(v).trim() || '#b84a33')
  const scale = Math.min(window.devicePixelRatio || 1, 2)
  const w = (canvas.width = canvas.clientWidth * scale)
  const h = (canvas.height = canvas.clientHeight * scale)
  const pieces = Array.from({ length: 110 }, (_, i) => ({
    x: w / 2 + (Math.random() - 0.5) * w * 0.3,
    y: h * 0.55,
    vx: (Math.random() - 0.5) * w * 1.6,
    vy: -(0.6 + Math.random() * 0.9) * h * 1.3,
    rot: Math.random() * Math.PI,
    spin: (Math.random() - 0.5) * 14,
    size: (5 + Math.random() * 5) * scale,
    color: colors[i % colors.length],
  }))
  const gravity = h * 2.2
  let last = performance.now()
  let elapsed = 0
  let frame = requestAnimationFrame(function tick(now) {
    const dt = Math.min(now - last, 50) / 1000
    last = now
    elapsed += dt
    ctx.clearRect(0, 0, w, h)
    for (const p of pieces) {
      p.vx *= Math.pow(0.35, dt)
      p.vy += gravity * dt
      p.vy *= Math.pow(0.6, dt)
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.rot += p.spin * dt
      ctx.save()
      ctx.globalAlpha = Math.max(0, Math.min(1, 3 - elapsed))
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.scale(1, Math.cos(p.rot * 1.7))
      ctx.fillStyle = p.color
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
      ctx.restore()
    }
    frame = elapsed < 3 ? requestAnimationFrame(tick) : (ctx.clearRect(0, 0, w, h), 0)
  })
  return () => {
    cancelAnimationFrame(frame)
    ctx.clearRect(0, 0, w, h)
  }
}
