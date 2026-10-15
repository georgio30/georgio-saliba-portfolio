// Snake's engine, effects, drawing and sound. Nothing here touches React: the component
// owns one game object and calls these on every animation frame.

// Every bite is one of the tools this site and its projects are built with
export const TECH = ['React', 'TypeScript', 'Node.js', 'Express', 'MySQL', 'JWT', 'Tailwind', 'Vite']
export const CELLS = 16
export const COUNTDOWN = 1200 // ms of "3, 2, 1" before a paused game moves again

// `start` and `floor` are ms per step; `faster` is how much quicker each bite makes it
export const LEVELS = {
  chill: { start: 165, floor: 115, faster: 2, wrap: true, bonus: 3 },
  classic: { start: 135, floor: 72, faster: 3, wrap: false, bonus: 3 },
  challenge: { start: 100, floor: 52, faster: 3, wrap: false, bonus: 5 },
}
export const LEVEL_IDS = Object.keys(LEVELS)

const BONUS_EVERY = 5 // bites between bonus bites
const BONUS_TICKS = 42 // how long a bonus bite stays, in steps

export const DIRS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
}

const same = (a, b) => a && b && a.x === b.x && a.y === b.y

function freeCell(g) {
  const free = []
  for (let x = 0; x < CELLS; x++)
    for (let y = 0; y < CELLS; y++) {
      const cell = { x, y }
      if (!g.snake.some((c) => same(c, cell)) && !same(g.food, cell) && !same(g.bonus, cell)) free.push(cell)
    }
  return free[Math.floor(Math.random() * free.length)] ?? null
}

export function fresh(level) {
  const snake = [{ x: 8, y: 8 }, { x: 7, y: 8 }, { x: 6, y: 8 }]
  const g = {
    level,
    snake,
    prev: snake.map((c) => ({ ...c })), // where each segment was one step ago, for smooth drawing
    dir: DIRS.right,
    queue: [], // turns waiting for the next steps, so quick double taps aren't lost
    food: null,
    bonus: null,
    eaten: 0,
    points: 0,
    acc: 0, // ms since the last step
    countdown: 0,
    dead: 0, // when the snake crashed, for the shake
    passed: false, // already told the player they beat their best this game
    fx: [],
    animUntil: performance.now() + 450,
  }
  g.food = { ...freeCell(g), tech: 0, born: performance.now() }
  return g
}

export const tickMs = (g) => {
  const l = LEVELS[g.level]
  return Math.max(l.floor, l.start - g.eaten * l.faster)
}

// Queues a turn unless it would reverse into the neck or repeat the current heading
export function turn(g, name) {
  const next = DIRS[name]
  const last = g.queue.at(-1) ?? g.dir
  const reverse = next.x === -last.x && next.y === -last.y
  if (!reverse && next !== last && g.queue.length < 3) g.queue.push(next)
}

// One step of the game. Returns what happened, if anything worth reacting to
export function advance(g) {
  const level = LEVELS[g.level]
  g.prev = g.snake.map((c) => ({ ...c }))
  if (g.queue.length) g.dir = g.queue.shift()

  let x = g.snake[0].x + g.dir.x
  let y = g.snake[0].y + g.dir.y
  if (level.wrap) {
    x = (x + CELLS) % CELLS
    y = (y + CELLS) % CELLS
  }
  const head = { x, y }
  const onFood = same(head, g.food)
  const onBonus = same(head, g.bonus)
  // The tail moves out of the way unless the snake is about to grow
  const body = onFood || onBonus ? g.snake : g.snake.slice(0, -1)
  if (x < 0 || y < 0 || x >= CELLS || y >= CELLS || body.some((c) => same(c, head))) return { type: 'crash' }

  g.snake.unshift(head)
  if (!onFood && !onBonus) g.snake.pop()
  if (g.bonus && !onBonus && --g.bonus.ticks <= 0) g.bonus = null

  if (onBonus) {
    g.bonus = null
    g.points += level.bonus
    return { type: 'bonus', x, y, gain: level.bonus }
  }
  if (onFood) {
    const tech = g.food.tech
    g.eaten += 1
    g.points += 1
    const now = performance.now()
    const cell = freeCell(g)
    g.food = cell && { ...cell, tech: g.eaten % TECH.length, born: now }
    if (g.eaten % BONUS_EVERY === 0 && !g.bonus) {
      const spot = freeCell(g)
      if (spot) g.bonus = { ...spot, ticks: BONUS_TICKS, total: BONUS_TICKS, born: now }
    }
    g.animUntil = now + 450
    return { type: 'eat', x, y, tech, gain: 1 }
  }
  return null
}

/* ---------- Effects ---------- */

const MAX_FX = 180

export function burst(g, x, y, colors, count, speed) {
  for (let i = 0; i < count && g.fx.length < MAX_FX; i++) {
    const angle = Math.random() * Math.PI * 2
    const v = speed * (0.35 + Math.random() * 0.65)
    g.fx.push({
      kind: 'dot',
      x: x + 0.5,
      y: y + 0.5,
      vx: Math.cos(angle) * v,
      vy: Math.sin(angle) * v,
      drag: true,
      r: 0.05 + Math.random() * 0.07,
      life: 0,
      ttl: 360 + Math.random() * 260,
      color: colors[i % colors.length],
    })
  }
  g.fx.push({ kind: 'ring', x: x + 0.5, y: y + 0.5, life: 0, ttl: 420, color: colors[0] })
}

export function popup(g, x, y, text, color = 'accent', size = 0.62) {
  // Kept far enough from the edges that the whole label shows
  const margin = 0.3 + text.length * size * 0.28
  const cx = Math.min(Math.max(x + 0.5, margin), CELLS - margin)
  const cy = Math.min(Math.max(y + 0.1, 0.8), CELLS - 0.4)
  g.fx.push({ kind: 'text', x: cx, y: cy, vx: 0, vy: -1.4, text, size, life: 0, ttl: 800, color })
}

export function confetti(g) {
  const colors = ['accent', 'accentSoft', 'fg']
  for (let i = 0; i < 90 && g.fx.length < MAX_FX; i++) {
    g.fx.push({
      kind: 'paper',
      x: Math.random() * CELLS,
      y: -Math.random() * 4,
      vx: (Math.random() - 0.5) * 3,
      vy: 2 + Math.random() * 4,
      gravity: 5,
      rot: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 12,
      w: 0.22 + Math.random() * 0.16,
      h: 0.12 + Math.random() * 0.08,
      life: 0,
      ttl: 2400 + Math.random() * 800,
      color: colors[i % colors.length],
    })
  }
}

export function updateFx(g, dt) {
  const k = dt / 1000
  g.fx = g.fx.filter((p) => (p.life += dt) < p.ttl)
  for (const p of g.fx) {
    if (p.vx === undefined) continue
    p.x += p.vx * k
    p.y += p.vy * k
    if (p.gravity) p.vy += p.gravity * k
    if (p.spin) p.rot += p.spin * k
    if (p.drag) {
      const slow = Math.pow(0.015, k)
      p.vx *= slow
      p.vy *= slow
    }
  }
}

/* ---------- Drawing ---------- */

export function readPalette() {
  const css = getComputedStyle(document.documentElement)
  const v = (name, fallback) => css.getPropertyValue(name).trim() || fallback
  return {
    surface: v('--color-surface', '#fff'),
    fg: v('--color-fg', '#1b1a18'),
    muted: v('--color-muted', '#6f6f6a'),
    line: v('--color-line', '#e5e3dc'),
    accent: v('--color-accent', '#b84a33'),
    accentSoft: v('--color-accent-soft', '#e8846b'),
    sans: v('--font-sans', 'system-ui, sans-serif'),
    display: v('--font-display', 'Georgia, serif'),
  }
}

// Moves from p towards c by a (0–1). A jump across the board means the snake went through a wall
function toward(p, c, a) {
  let dx = c.x - p.x
  let dy = c.y - p.y
  if (Math.abs(dx) > 1) dx = -Math.sign(dx)
  if (Math.abs(dy) > 1) dy = -Math.sign(dy)
  return { x: p.x + dx * a, y: p.y + dy * a }
}

// The body's centre line, part way through the current step: the head and tail slide,
// every joint in between sits on a cell, so corners stay crisp
function bodyPath(g, a) {
  const { prev, snake } = g
  const pts = [toward(prev[0], snake[0], a)]
  for (let i = 0; i < snake.length - 1; i++) pts.push(prev[i])
  pts.push(toward(prev[snake.length - 1] ?? prev.at(-1), snake.at(-1), a))
  return pts
}

function text(ctx, s, str, x, y, size, font, color) {
  ctx.save()
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.fillStyle = color
  ctx.font = `${Math.round(size * s)}px ${font}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(str, x * s, y * s)
  ctx.restore()
}

function star(ctx, cx, cy, r, turnBy) {
  ctx.beginPath()
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 ? r * 0.48 : r
    const angle = -Math.PI / 2 + turnBy + (i * Math.PI) / 5
    ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius)
  }
  ctx.closePath()
}

const easeOutBack = (t) => 1 + 2.4 * Math.pow(t - 1, 3) + 1.4 * Math.pow(t - 1, 2)

export function drawBoard(canvas, g, c, now, reduced) {
  const ctx = canvas.getContext('2d')
  const s = canvas.width / CELLS
  const cssPx = canvas.width / (canvas.clientWidth || canvas.width)

  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.fillStyle = c.surface
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const shake = g.dead && !reduced ? 1 - (now - g.dead) / 380 : 0
  const ox = shake > 0 ? Math.sin(now / 16) * shake * s * 0.2 : 0
  const oy = shake > 0 ? Math.cos(now / 21) * shake * s * 0.12 : 0
  ctx.setTransform(s, 0, 0, s, ox, oy)

  // A quiet grid, one CSS pixel wide at any size
  ctx.strokeStyle = c.line
  ctx.lineWidth = cssPx / s
  ctx.globalAlpha = 0.7
  ctx.beginPath()
  for (let i = 1; i < CELLS; i++) {
    ctx.moveTo(i, 0)
    ctx.lineTo(i, CELLS)
    ctx.moveTo(0, i)
    ctx.lineTo(CELLS, i)
  }
  ctx.stroke()
  ctx.globalAlpha = 1

  const a = Math.min(g.acc / tickMs(g), 1)

  if (g.food) {
    const grow = reduced ? 1 : easeOutBack(Math.min((now - g.food.born) / 320, 1))
    const pulse = reduced ? 0 : Math.sin(now / 280) * 0.025
    const r = 0.3 * grow + pulse
    const cx = g.food.x + 0.5
    const cy = g.food.y + 0.5
    ctx.fillStyle = c.accent
    ctx.globalAlpha = 0.16
    ctx.beginPath()
    ctx.arc(cx, cy, Math.max(r + 0.14, 0), 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1
    ctx.beginPath()
    ctx.arc(cx, cy, Math.max(r, 0), 0, Math.PI * 2)
    ctx.fill()
  }

  if (g.bonus) {
    const b = g.bonus
    const left = Math.max((b.ticks - a) / b.total, 0)
    const grow = reduced ? 1 : easeOutBack(Math.min((now - b.born) / 360, 1))
    const cx = b.x + 0.5
    const cy = b.y + 0.5
    // Blinks as it runs out
    ctx.globalAlpha = left < 0.3 && !reduced ? 0.55 + 0.45 * Math.sin(now / 55) : 1
    ctx.fillStyle = c.accentSoft
    star(ctx, cx, cy, 0.4 * grow, reduced ? 0 : now / 1400)
    ctx.fill()
    ctx.strokeStyle = c.accent
    ctx.lineWidth = 0.07
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.arc(cx, cy, 0.48, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * left)
    ctx.stroke()
    ctx.globalAlpha = 1
  }

  // The snake: one thick rounded stroke, then the head on top
  const pts = bodyPath(g, a)
  ctx.strokeStyle = c.fg
  ctx.fillStyle = c.fg
  ctx.globalAlpha = g.dead ? 0.45 : 0.86
  ctx.lineWidth = 0.66
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  pts.forEach((p, i) => {
    if (i === 0) return ctx.moveTo(p.x + 0.5, p.y + 0.5)
    const q = pts[i - 1]
    const dx = p.x - q.x
    const dy = p.y - q.y
    if (Math.abs(dx) > 1.5 || Math.abs(dy) > 1.5) {
      // Through a wall: finish this piece past the edge and start again on the other side
      const d = { x: Math.abs(dx) > 1.5 ? -Math.sign(dx) : 0, y: Math.abs(dy) > 1.5 ? -Math.sign(dy) : 0 }
      ctx.lineTo(q.x + 0.5 + d.x * 0.8, q.y + 0.5 + d.y * 0.8)
      ctx.moveTo(p.x + 0.5 - d.x * 0.8, p.y + 0.5 - d.y * 0.8)
    }
    ctx.lineTo(p.x + 0.5, p.y + 0.5)
  })
  ctx.stroke()

  ctx.globalAlpha = g.dead ? 0.55 : 1
  const head = pts[0]
  const heads = [head]
  // Halfway through a wall, the head shows on both sides
  if (head.x < -0.01) heads.push({ x: head.x + CELLS, y: head.y })
  if (head.x > CELLS - 0.99) heads.push({ x: head.x - CELLS, y: head.y })
  if (head.y < -0.01) heads.push({ x: head.x, y: head.y + CELLS })
  if (head.y > CELLS - 0.99) heads.push({ x: head.x, y: head.y - CELLS })
  const side = { x: -g.dir.y, y: g.dir.x }
  for (const h of heads) {
    const cx = h.x + 0.5
    const cy = h.y + 0.5
    ctx.fillStyle = c.fg
    ctx.beginPath()
    ctx.arc(cx, cy, 0.41, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = c.surface
    for (const sign of [-1, 1]) {
      ctx.beginPath()
      ctx.arc(cx + g.dir.x * 0.13 + side.x * 0.17 * sign, cy + g.dir.y * 0.13 + side.y * 0.17 * sign, 0.075, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  ctx.globalAlpha = 1

  if (g.countdown > 0) {
    const n = Math.ceil(g.countdown / (COUNTDOWN / 3))
    const part = (g.countdown % (COUNTDOWN / 3)) / (COUNTDOWN / 3)
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.fillStyle = c.surface
    ctx.globalAlpha = 0.55
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.globalAlpha = reduced ? 1 : 0.35 + 0.65 * part
    text(ctx, s, String(n), CELLS / 2, CELLS / 2, reduced ? 4 : 3.4 + part, c.display, c.fg)
    ctx.globalAlpha = 1
  }
}

// Particles live on their own canvas above the menus, so the celebration shows over them
export function drawFx(canvas, g, c) {
  const ctx = canvas.getContext('2d')
  const s = canvas.width / CELLS
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.setTransform(s, 0, 0, s, 0, 0)
  for (const p of g.fx) {
    const f = 1 - p.life / p.ttl
    ctx.fillStyle = c[p.color]
    ctx.strokeStyle = c[p.color]
    if (p.kind === 'dot') {
      ctx.globalAlpha = f
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r * (0.4 + 0.6 * f), 0, Math.PI * 2)
      ctx.fill()
    } else if (p.kind === 'ring') {
      ctx.globalAlpha = f * 0.7
      ctx.lineWidth = 0.08 * f
      ctx.beginPath()
      ctx.arc(p.x, p.y, 0.35 + (1 - f) * 0.75, 0, Math.PI * 2)
      ctx.stroke()
    } else if (p.kind === 'text') {
      ctx.globalAlpha = Math.min(1, f * 2.5)
      text(ctx, s, p.text, p.x, p.y, p.size, c.display, c[p.color])
    } else if (p.kind === 'paper') {
      ctx.globalAlpha = Math.min(1, f * 3)
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.scale(1, Math.cos(p.rot * 1.7))
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
      ctx.restore()
    }
  }
  ctx.globalAlpha = 1
}

/* ---------- Sound ---------- */

// Tiny synthesised blips; no audio files to download. Each note is [frequency, start, length] in Hz and seconds
const SOUNDS = {
  eat: { wave: 'sine', notes: [[620, 0, 0.07], [930, 0.045, 0.09]] },
  bonus: { wave: 'triangle', notes: [[660, 0, 0.07], [880, 0.06, 0.07], [1320, 0.12, 0.14]] },
  passed: { wave: 'triangle', notes: [[784, 0, 0.08], [1047, 0.08, 0.14]] },
  crash: { wave: 'triangle', notes: [[260, 0, 0.12], [174, 0.1, 0.26]] },
  best: { wave: 'triangle', notes: [[523, 0, 0.1], [659, 0.1, 0.1], [784, 0.2, 0.1], [1047, 0.3, 0.3]] },
}

let audio

export function sound(name) {
  try {
    audio ??= new (window.AudioContext || window.webkitAudioContext)()
    if (audio.state === 'suspended') audio.resume()
    if (!name) return // just waking the audio up during a click, as browsers require
    const { wave, notes } = SOUNDS[name]
    const t0 = audio.currentTime + 0.01
    for (const [freq, at, len] of notes) {
      const osc = audio.createOscillator()
      const gain = audio.createGain()
      osc.type = wave
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.0001, t0 + at)
      gain.gain.exponentialRampToValueAtTime(0.06, t0 + at + 0.012)
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + at + len)
      osc.connect(gain).connect(audio.destination)
      osc.start(t0 + at)
      osc.stop(t0 + at + len + 0.03)
    }
  } catch {
    // No Web Audio — the game just stays quiet
  }
}
