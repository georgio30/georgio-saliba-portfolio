// The island's small models: one landmark per kind of project, lamps, grass and clouds.
// Everything is built from a few primitives, faces +z (the island turns each one toward the middle),
// and sits on a pedestal whose top is at y = 0.
import { BoxGeometry, ConeGeometry, CylinderGeometry, DoubleSide, Group, IcosahedronGeometry, Mesh, PointLight, SphereGeometry } from 'three'

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

// The shack on the home island: Georgio's place, with a porch light and a chimney
function shack(m, wall) {
  const g = new Group()
  g.add(box(0.9, 0.55, 0.7, wall, 0, 0.275, 0))
  // A gable roof: a three-sided prism lying along x, apex up, then squashed to a gentle pitch
  const roof = part(new CylinderGeometry(0.46, 0.46, 1.04, 3), m.roof)
  roof.rotation.z = Math.PI / 2
  roof.rotation.x = -Math.PI / 2
  const roofTilt = new Group()
  roofTilt.add(roof)
  roofTilt.scale.y = 0.6
  roofTilt.position.y = 0.55 + 0.23 * 0.6
  g.add(roofTilt)
  g.add(box(0.11, 0.3, 0.11, m.stone, -0.28, 0.9, -0.12))
  g.add(box(0.2, 0.34, 0.03, m.wood, 0.12, 0.17, 0.36))
  g.add(box(0.18, 0.15, 0.02, m.window, -0.24, 0.32, 0.355))
  // Porch: boards, two posts and a lamp by the door
  g.add(box(0.9, 0.04, 0.26, m.wood, 0, 0.02, 0.48))
  g.add(cyl(0.02, 0.02, 0.4, 4, m.wood, -0.4, 0.2, 0.58))
  g.add(cyl(0.02, 0.02, 0.4, 4, m.wood, 0.4, 0.2, 0.58))
  g.add(box(0.94, 0.04, 0.3, m.roof, 0, 0.42, 0.5))
  g.add(part(new SphereGeometry(0.035, 8, 6), m.window, 0.3, 0.36, 0.38))
  // A bench and a mug on the porch
  g.add(box(0.26, 0.04, 0.09, m.wood, -0.18, 0.13, 0.5))
  g.add(cyl(0.025, 0.022, 0.04, 8, m.accent, -0.12, 0.17, 0.5))
  return { group: g, top: 1.05, update: () => {} }
}

// The hangar: an arched shed that leads to the games
function hangar(m, wall) {
  const g = new Group()
  const arch = part(new CylinderGeometry(0.55, 0.55, 1.1, 14, 1, true, -Math.PI / 2, Math.PI), wall, 0, 0, 0)
  arch.rotation.x = -Math.PI / 2
  arch.material.side = DoubleSide
  g.add(arch)
  g.add(box(1.1, 0.02, 1.1, m.path, 0, 0.01, 0))
  // Back wall and a dark inside, so it reads as open at the front
  const back = part(new CylinderGeometry(0.54, 0.54, 0.02, 14, 1, false, -Math.PI / 2, Math.PI), m.dark, 0, 0, -0.54)
  back.rotation.x = -Math.PI / 2
  g.add(back)
  g.add(box(0.36, 0.08, 0.03, m.window, 0, 0.62, 0.56))
  // A windsock on a pole beside it
  const sock = new Group()
  sock.position.set(0.72, 0, 0.25)
  sock.add(cyl(0.015, 0.015, 0.7, 4, m.metal, 0, 0.35, 0))
  const cone = part(new ConeGeometry(0.06, 0.26, 8, 1, true), m.accent, 0.13, 0.66, 0)
  cone.rotation.z = Math.PI / 2
  sock.add(cone)
  g.add(sock)
  return {
    group: g,
    top: 0.75,
    update: (t) => (cone.rotation.y = Math.sin(t * 1.7) * 0.35),
  }
}

const KINDS = { clinic, shop, kitchen, workshop, shack, hangar }

export function buildLandmark(kind, m, wall) {
  return (KINDS[kind] ?? workshop)(m, wall)
}

// A small propeller plane, nose along +z, wheels touching y = 0
export function buildPlane(m, body, scale = 1) {
  const g = new Group()
  const inner = new Group()
  inner.scale.setScalar(scale)
  g.add(inner)
  const fuselage = part(new CylinderGeometry(0.11, 0.07, 0.9, 8), body, 0, 0.26, 0)
  fuselage.rotation.x = Math.PI / 2
  inner.add(fuselage)
  const nose = part(new ConeGeometry(0.11, 0.14, 8), m.dark, 0, 0.26, 0.52)
  nose.rotation.x = Math.PI / 2
  inner.add(nose)
  inner.add(box(1.15, 0.035, 0.24, m.cloth, 0, 0.3, 0.08))
  inner.add(box(0.42, 0.03, 0.14, m.cloth, 0, 0.29, -0.4))
  inner.add(box(0.03, 0.2, 0.16, body, 0, 0.38, -0.4))
  inner.add(box(0.12, 0.08, 0.16, m.screen, 0, 0.36, 0.14))
  // Landing gear
  inner.add(cyl(0.012, 0.012, 0.16, 4, m.metal, -0.14, 0.12, 0.14))
  inner.add(cyl(0.012, 0.012, 0.16, 4, m.metal, 0.14, 0.12, 0.14))
  for (const x of [-0.14, 0.14]) {
    const wheel = cyl(0.045, 0.045, 0.03, 10, m.dark, x, 0.045, 0.14)
    wheel.rotation.z = Math.PI / 2
    inner.add(wheel)
  }
  const tail = cyl(0.025, 0.025, 0.03, 8, m.dark, 0, 0.12, -0.4)
  tail.rotation.z = Math.PI / 2
  inner.add(tail)
  // Propeller: two blades on a hub, spun by the scene
  const prop = new Group()
  prop.position.set(0, 0.26, 0.6)
  prop.add(box(0.04, 0.42, 0.015, m.dark))
  prop.add(box(0.42, 0.04, 0.015, m.dark))
  prop.add(part(new SphereGeometry(0.03, 8, 6), m.metal))
  inner.add(prop)
  return { group: g, prop }
}

// The cozy garden in front of the shack: two flower beds and a round tree
export function buildGarden(m, random) {
  const g = new Group()
  const flowers = [m.accent, m.cloth, m.window, m.roof]
  for (const [bx, bz, w, d] of [
    [-0.55, 0.15, 0.7, 0.32],
    [0.6, 0.2, 0.55, 0.32],
  ]) {
    g.add(box(w, 0.08, d, m.soil, bx, 0.04, bz))
    for (let i = 0; i < 9; i++) {
      const fx = bx + (random() - 0.5) * (w - 0.1)
      const fz = bz + (random() - 0.5) * (d - 0.08)
      g.add(cyl(0.008, 0.008, 0.1, 3, m.tree, fx, 0.13, fz))
      const bloom = part(new IcosahedronGeometry(0.035, 0), flowers[i % flowers.length], fx, 0.19, fz)
      bloom.castShadow = false
      g.add(bloom)
    }
  }
  // A round-crowned tree
  const crown = part(new IcosahedronGeometry(0.42, 1), m.tree, 1.25, 0.95, -0.25)
  g.add(crown)
  g.add(cyl(0.06, 0.08, 0.6, 6, m.trunk, 1.25, 0.3, -0.25))
  return g
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
