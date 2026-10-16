// The island's small models: one landmark per kind of project, lamps, grass and clouds.
// Everything is built from a few primitives, faces +z (the island turns each one toward the middle),
// and sits on a pedestal whose top is at y = 0.
import { BoxGeometry, ConeGeometry, CylinderGeometry, Group, IcosahedronGeometry, Mesh, PointLight, SphereGeometry } from 'three'

function part(geometry, mat, x = 0, y = 0, z = 0) {
  const m = new Mesh(geometry, mat)
  m.position.set(x, y, z)
  m.castShadow = m.receiveShadow = true
  return m
}
const box = (w, h, d, mat, x, y, z) => part(new BoxGeometry(w, h, d), mat, x, y, z)
const cyl = (rt, rb, h, seg, mat, x, y, z) => part(new CylinderGeometry(rt, rb, h, seg), mat, x, y, z)

// Saliba Polyclinic: a small clinic whose door slides open when you arrive (access, granted)
function clinic(m, wall) {
  const g = new Group()
  g.add(box(1, 0.62, 0.72, wall, 0, 0.31, 0))
  g.add(box(1.08, 0.07, 0.8, m.roof, 0, 0.655, 0))
  g.add(box(0.3, 0.12, 0.3, wall, 0.22, 0.75, -0.1))
  // The cross over the door
  g.add(box(0.07, 0.22, 0.03, m.accent, 0, 0.5, 0.37))
  g.add(box(0.22, 0.07, 0.03, m.accent, 0, 0.5, 0.37))
  // Lit windows
  g.add(box(0.17, 0.14, 0.02, m.window, -0.32, 0.38, 0.365))
  g.add(box(0.17, 0.14, 0.02, m.window, 0.32, 0.38, 0.365))
  // Behind the door, a warm doorway that shows once it slides aside
  g.add(box(0.18, 0.3, 0.01, m.window, 0, 0.16, 0.361))
  const door = box(0.2, 0.32, 0.03, m.dark, 0, 0.16, 0.38)
  g.add(door)
  return {
    group: g,
    top: 0.85,
    update: (t, lift) => (door.position.x = lift * 0.2),
  }
}

// Iverse: a market stall with a striped awning and a shopping cart
function shop(m, wall) {
  const g = new Group()
  g.add(box(0.9, 0.36, 0.42, wall, 0, 0.18, 0.05))
  for (const [x, z] of [
    [-0.43, -0.16],
    [0.43, -0.16],
    [-0.43, 0.26],
    [0.43, 0.26],
  ])
    g.add(cyl(0.025, 0.025, 0.8, 5, m.wood, x, 0.4, z))
  const awning = new Group()
  awning.position.set(0, 0.82, 0.05)
  for (let i = 0; i < 5; i++) awning.add(box(0.19, 0.03, 0.58, i % 2 ? m.cloth : m.accent, -0.38 + i * 0.19, 0, 0))
  awning.rotation.x = -0.3
  g.add(awning)
  // Goods on the counter
  g.add(box(0.14, 0.12, 0.12, m.accent, -0.22, 0.42, 0.08))
  g.add(box(0.12, 0.16, 0.1, m.roof, 0.02, 0.44, 0.04))
  g.add(cyl(0.06, 0.06, 0.1, 8, m.cloth, 0.24, 0.41, 0.1))
  // The cart
  const cart = new Group()
  cart.position.set(0.66, 0, 0.32)
  cart.rotation.y = -0.5
  cart.add(box(0.26, 0.15, 0.18, m.metal, 0, 0.22, 0))
  cart.add(cyl(0.012, 0.012, 0.22, 4, m.metal, -0.15, 0.3, 0))
  for (const [x, z] of [
    [-0.09, -0.07],
    [0.09, -0.07],
    [-0.09, 0.07],
    [0.09, 0.07],
  ]) {
    const wheel = cyl(0.035, 0.035, 0.03, 8, m.dark, x, 0.04, z)
    wheel.rotation.x = Math.PI / 2
    cart.add(wheel)
  }
  g.add(cart)
  return {
    group: g,
    top: 1,
    update: (t, lift) => {
      awning.rotation.x = -0.3 + Math.sin(t * 2.2) * 0.025 * (0.4 + lift)
      cart.position.x = 0.66 + lift * 0.08
    },
  }
}

// Recipe Finder: a round kitchen hut with steam rising from the chimney
function kitchen(m, wall) {
  const g = new Group()
  g.add(cyl(0.42, 0.44, 0.5, 8, wall, 0, 0.25, 0))
  g.add(part(new ConeGeometry(0.58, 0.42, 8), m.roof, 0, 0.71, 0))
  g.add(box(0.12, 0.32, 0.12, m.stone, 0.2, 0.86, -0.12))
  g.add(box(0.18, 0.3, 0.04, m.dark, 0, 0.15, 0.42))
  g.add(box(0.14, 0.12, 0.03, m.window, -0.26, 0.32, 0.34))
  // A pot simmering by the door
  g.add(cyl(0.1, 0.08, 0.12, 8, m.dark, 0.42, 0.06, 0.32))
  g.add(cyl(0.085, 0.085, 0.01, 8, m.accent, 0.42, 0.125, 0.32))
  const puffs = Array.from({ length: 4 }, (_, i) => {
    const puff = part(new IcosahedronGeometry(0.07, 0), m.steam, 0.2, 1.05, -0.12)
    puff.castShadow = false
    puff.userData.phase = i / 4
    g.add(puff)
    return puff
  })
  return {
    group: g,
    top: 1.2,
    update: (t, lift) => {
      for (const p of puffs) {
        const k = (t * (0.35 + lift * 0.4) + p.userData.phase) % 1
        p.position.set(0.2 + Math.sin((k + p.userData.phase) * 6) * 0.05, 1.05 + k * 0.7, -0.12 - k * 0.1)
        p.scale.setScalar(0.6 + k * 1.4 - (k > 0.75 ? (k - 0.75) * 7 : 0))
      }
    },
  }
}

// This portfolio: a desk with a glowing screen, a lamp and a chair
function workshop(m, wall) {
  const g = new Group()
  g.add(box(0.9, 0.05, 0.46, m.wood, 0, 0.44, -0.05))
  for (const [x, z] of [
    [-0.4, -0.24],
    [0.4, -0.24],
    [-0.4, 0.14],
    [0.4, 0.14],
  ])
    g.add(box(0.04, 0.42, 0.04, m.wood, x, 0.21, z))
  g.add(box(0.06, 0.14, 0.06, m.dark, 0, 0.53, -0.15))
  g.add(box(0.54, 0.34, 0.04, m.dark, 0, 0.74, -0.15))
  g.add(box(0.48, 0.28, 0.01, m.screen, 0, 0.74, -0.127))
  g.add(box(0.3, 0.02, 0.1, m.roof, 0, 0.475, 0.08))
  // Lamp
  g.add(cyl(0.05, 0.06, 0.02, 8, m.metal, 0.34, 0.475, -0.12))
  g.add(cyl(0.012, 0.012, 0.28, 4, m.metal, 0.34, 0.62, -0.12))
  const shade = part(new ConeGeometry(0.08, 0.1, 8, 1, true), m.accent, 0.3, 0.77, -0.08)
  shade.rotation.z = 0.6
  g.add(shade)
  g.add(part(new SphereGeometry(0.03, 8, 6), m.window, 0.29, 0.73, -0.07))
  // Chair, in the house colour
  g.add(box(0.3, 0.04, 0.28, wall, 0, 0.26, 0.38))
  g.add(box(0.3, 0.32, 0.04, wall, 0, 0.42, 0.53))
  g.add(cyl(0.02, 0.02, 0.24, 4, m.metal, 0, 0.12, 0.38))
  return { group: g, top: 1.05, update: () => {} }
}

// The arcade: a cabinet that leads to Snake and Minesweeper
function arcade(m, wall) {
  const g = new Group()
  g.add(box(0.5, 0.95, 0.44, m.dark, 0, 0.475, -0.02))
  g.add(box(0.04, 0.95, 0.46, wall, -0.27, 0.475, -0.02))
  g.add(box(0.04, 0.95, 0.46, wall, 0.27, 0.475, -0.02))
  const screen = box(0.38, 0.3, 0.02, m.screen, 0, 0.72, 0.21)
  screen.rotation.x = -0.22
  g.add(screen)
  const panel = box(0.5, 0.06, 0.22, m.roof, 0, 0.5, 0.28)
  panel.rotation.x = 0.3
  g.add(panel)
  const stick = new Group()
  stick.position.set(-0.11, 0.55, 0.29)
  stick.add(cyl(0.012, 0.012, 0.09, 4, m.metal, 0, 0.045, 0))
  stick.add(part(new SphereGeometry(0.03, 8, 6), m.accent, 0, 0.095, 0))
  g.add(stick)
  g.add(cyl(0.025, 0.025, 0.02, 8, m.accent, 0.06, 0.545, 0.3))
  g.add(cyl(0.025, 0.025, 0.02, 8, m.window, 0.14, 0.545, 0.29))
  g.add(box(0.5, 0.12, 0.1, m.window, 0, 0.98, 0.17))
  return {
    group: g,
    top: 1.15,
    update: (t, lift) => {
      stick.rotation.z = Math.sin(t * 5) * 0.25 * lift
      stick.rotation.x = Math.cos(t * 4) * 0.2 * lift
    },
  }
}

const KINDS = { clinic, shop, kitchen, workshop, arcade }

export function buildLandmark(kind, m, wall) {
  return (KINDS[kind] ?? workshop)(m, wall)
}

// A lamp post; its light only switches on at night
export function buildLamp(m) {
  const g = new Group()
  g.add(cyl(0.03, 0.04, 0.9, 6, m.metal, 0, 0.45, 0))
  g.add(cyl(0.07, 0.05, 0.05, 6, m.metal, 0, 0.92, 0))
  const bulb = part(new IcosahedronGeometry(0.06, 0), m.window, 0, 0.98, 0)
  bulb.castShadow = false
  g.add(bulb)
  const light = new PointLight(0xffc78a, 0, 3.2, 1.6)
  light.position.y = 0.98
  g.add(light)
  return { group: g, light }
}

// A soft cloud of a few flattened spheres
export function buildCloud(m, random) {
  const g = new Group()
  const n = 3 + Math.floor(random() * 2)
  for (let i = 0; i < n; i++) {
    const r = 0.35 + random() * 0.3
    const puff = new Mesh(new IcosahedronGeometry(r, 1), m.cloud)
    puff.position.set(i * 0.45 - n * 0.2, random() * 0.15, random() * 0.25)
    puff.scale.y = 0.7
    g.add(puff)
  }
  return g
}
