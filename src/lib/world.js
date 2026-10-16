// The hero's little world: a home island with Georgio's shack and hangar, one island per project around it,
// and a small plane that flies between them. Click an island and it flies there and lands; or steer it
// with the arrow keys and press Enter over an island to land.
// Plain three.js with no React, loaded on its own after the page has painted (see HeroWorld.jsx).
// The models live in world-props.js.
import {
  AdditiveBlending,
  BufferAttribute,
  BoxGeometry,
  BufferGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DirectionalLight,
  DodecahedronGeometry,
  Group,
  HemisphereLight,
  IcosahedronGeometry,
  InstancedMesh,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  PCFSoftShadowMap,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Raycaster,
  Scene,
  TorusGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three'
import { buildCloud, buildGarden, buildLamp, buildLandmark, buildPlane } from './world-props'

const HOME_R = 3.3 // the home island's radius
const ISLE_R = 2.05 // each project island's radius
const RING = 7.4 // how far the project islands sit from home
const HEIGHTS = [0.25, -0.15, 0.35, -0.05] // project islands float at slightly different heights
const CRUISE = 2.4 // flying height
const MODEL_SCALE = 1.3 // the models are built at a desk-toy scale; this sizes them to their islands
const VIEW = 17 // world units the camera frames across
const FOV = 30
const SPEED = { auto: 5.2, min: 2, max: 7 }
const TURN = 2.5 // radians per second
const BOUNDS = 12.5 // past this the plane turns back toward home
const HOME_KINDS = ['shack', 'hangar']

// Natural colours the theme's neutrals are tinted toward, by day and by night
const NATURE = {
  day: { grass: '#b9c49f', tree: '#7d9169', path: '#d8cdb8', soil: '#8a6a4f', sky: 0xfff3e2, ground: 0x8a8478, sun: 0xfff1dd, cloud: '#ffffff' },
  night: { grass: '#3a4636', tree: '#2c3a2c', path: '#4a4640', soil: '#33281f', sky: 0x8796c4, ground: 0x15171d, sun: 0xa9b6ff, cloud: '#5d6580' },
}

// Small seeded random, so the trees grow in the same places on every visit
function seeded(seed) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
}

const smooth = (dt, ms) => 1 - Math.exp(-dt / ms)
const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const easeOut = (t) => 1 - Math.pow(1 - t, 3)
// Heading h points along (sin h, cos h) in x/z
const headingOf = (x, z) => Math.atan2(x, z)
const turnBy = (from, to) => Math.atan2(Math.sin(to - from), Math.cos(to - from))

function bezier(a, b, c, d, t, out) {
  const u = 1 - t
  out.x = u * u * u * a.x + 3 * u * u * t * b.x + 3 * u * t * t * c.x + t * t * t * d.x
  out.y = u * u * u * a.y + 3 * u * u * t * b.y + 3 * u * t * t * c.y + t * t * t * d.y
  return out
}

// `landmarks`: [{ kind, tone }]. Shack and hangar go on the home island; every other kind gets its own island.
export function createWorld(canvas, { landmarks: specs, start = 0, reduced = false, onFrame, onNear, onPick }) {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' })
  renderer.setClearColor(0x000000, 0)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = PCFSoftShadowMap

  const scene = new Scene()
  const camera = new PerspectiveCamera(FOV, 1, 0.5, 160)

  const hemi = new HemisphereLight(0xffffff, 0x8a8478, 1.6)
  // The sun's shadow box follows the camera, so shadows stay sharp wherever the plane is
  const sun = new DirectionalLight(0xffffff, 2.1)
  sun.castShadow = true
  sun.shadow.mapSize.set(1024, 1024)
  Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 2, far: 40 })
  sun.shadow.bias = -0.0006
  scene.add(hemi, sun, sun.target)

  const flat = (extra) => new MeshStandardMaterial({ roughness: 0.92, metalness: 0, flatShading: true, ...extra })
  const mats = {
    top: flat(),
    side: flat(),
    rock: flat(),
    tree: flat(),
    trunk: flat(),
    grass: flat(),
    path: flat(),
    soil: flat(),
    roof: flat(),
    dark: flat(),
    accent: flat(),
    wood: flat(),
    cloth: flat(),
    metal: flat({ roughness: 0.6, metalness: 0.2 }),
    stone: flat(),
    body: flat(),
    body2: flat(),
    steam: flat({ transparent: true, opacity: 0.75 }),
    cloud: flat({ transparent: true, opacity: 0.92 }),
    // Windows, bulbs and screens: lit from inside, much brighter at night
    window: flat({ emissive: new Color('#ffcf8a') }),
    screen: flat({ emissive: new Color('#9fd3ff') }),
  }
  const glow = new MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
  const wallMats = specs.map(() => flat())

  const random = seeded(7)
  const pickables = []
  const tag = (object, i) =>
    object.traverse((o) => {
      if (!o.isMesh) return
      o.userData.landmark = i
      pickables.push(o)
    })

  // An island: a flat grassy top over a faceted rock that tapers to a point
  function island(x, y, z, r) {
    const g = new Group()
    g.position.set(x, y, z)
    const top = new Mesh(new CylinderGeometry(r, r * 0.97, 0.4, Math.round(24 + r * 10)), [mats.side, mats.top, mats.side])
    top.position.y = -0.2
    top.receiveShadow = true
    const rock = new Mesh(new ConeGeometry(r * 0.97, r * 1.15, 9, 2), mats.rock)
    rock.rotation.x = Math.PI
    rock.position.y = -0.4 - r * 0.575
    g.add(top, rock)
    scene.add(g)
    return g
  }

  // A packed-earth strip for taxiing and landing, from a to b (x/z) at height y
  function strip(a, b, y, width = 0.5) {
    const len = Math.hypot(b.x - a.x, b.y - a.y)
    const m = new Mesh(new BoxGeometry(width, 0.02, len), mats.path)
    m.position.set((a.x + b.x) / 2, y + 0.012, (a.y + b.y) / 2)
    m.rotation.y = headingOf(b.x - a.x, b.y - a.y)
    m.receiveShadow = true
    scene.add(m)
    return m
  }

  // Places where nothing grows: models, strips, lamps
  const keepClear = []
  const clearAt = (x, z, room) =>
    keepClear.every((k) => {
      if (k.r !== undefined) return Math.hypot(x - k.x, z - k.z) > k.r + room
      // A segment with a half-width
      const vx = k.b.x - k.a.x
      const vz = k.b.y - k.a.y
      const t = clamp(((x - k.a.x) * vx + (z - k.a.y) * vz) / (vx * vx + vz * vz), 0, 1)
      return Math.hypot(x - (k.a.x + vx * t), z - (k.a.y + vz * t)) > k.w + room
    })

  const islands = [] // { x, y, z, r, group, landmarks: [] }
  const home = { x: 0, y: 0, z: 0, r: HOME_R, group: island(0, 0, 0, HOME_R), landmarks: [] }
  islands.push(home)

  const projectIndexes = specs.map((s, i) => i).filter((i) => !HOME_KINDS.includes(specs[i].kind))
  const n = projectIndexes.length

  // Every landmark: its model, where the plane parks (spot) and which way it faces when it does (dir)
  const landmarks = specs.map(() => null)
  const lamps = []

  projectIndexes.forEach((i, k) => {
    const a = Math.PI / 2 - Math.PI / n - (k * 2 * Math.PI) / n
    const ux = Math.cos(a)
    const uz = Math.sin(a)
    const cx = ux * RING
    const cz = uz * RING
    const y = HEIGHTS[k % HEIGHTS.length]
    const isle = { x: cx, y, z: cz, r: ISLE_R, group: island(cx, y, cz, ISLE_R), landmarks: [i] }
    islands.push(isle)

    const model = buildLandmark(specs[i].kind, mats, wallMats[i])
    model.group.position.set(cx + ux * 0.85, y, cz + uz * 0.85)
    model.group.lookAt(0, y, 0)
    model.group.scale.setScalar(MODEL_SCALE)
    scene.add(model.group)
    tag(model.group, i)
    tag(isle.group, i)

    const spot = new Vector2(cx - ux * 0.35, cz - uz * 0.35)
    const dir = new Vector2(ux, uz)
    const a0 = new Vector2(cx - ux * 1.95, cz - uz * 1.95)
    tag(strip(a0, new Vector2(cx + ux * 0.1, cz + uz * 0.1), y, 0.55), i)
    keepClear.push({ a: a0, b: new Vector2(cx + ux * 0.2, cz + uz * 0.2), w: 0.4 }, { x: cx + ux * 0.85, z: cz + uz * 0.85, r: 0.85 })

    const lamp = buildLamp(mats)
    lamp.group.position.set(cx - ux * 0.9 - uz * 0.62, y, cz - uz * 0.9 + ux * 0.62)
    scene.add(lamp.group)
    lamps.push(lamp)
    keepClear.push({ x: lamp.group.position.x, z: lamp.group.position.z, r: 0.15 })

    landmarks[i] = { model, island: isle, spot, dir, y, lift: 0, glow: 0, labelY: y + model.top * MODEL_SCALE + 0.45 }
  })

  // The home island: shack and garden on the left, hangar and two small planes on the right
  const homeLayout = {
    shack: { x: -1.15, z: -0.85, spot: new Vector2(-1, 0.7) },
    hangar: { x: 1.35, z: -0.75, spot: new Vector2(1.35, 0.75) },
  }
  specs.forEach((spec, i) => {
    if (!HOME_KINDS.includes(spec.kind)) return
    const at = homeLayout[spec.kind]
    const model = buildLandmark(spec.kind, mats, wallMats[i])
    model.group.position.set(at.x, 0, at.z)
    model.group.scale.setScalar(MODEL_SCALE)
    scene.add(model.group)
    tag(model.group, i)
    home.landmarks.push(i)
    const dir = new Vector2(0, -1)
    tag(strip(new Vector2(at.spot.x, 2.35), new Vector2(at.spot.x, at.spot.y - 0.3), 0, 0.5), i)
    keepClear.push({ a: new Vector2(at.spot.x, 2.6), b: new Vector2(at.spot.x, at.spot.y - 0.3), w: 0.55 }, { x: at.x, z: at.z, r: 0.85 })
    landmarks[i] = { model, island: home, spot: at.spot, dir, y: 0, lift: 0, glow: 0, labelY: model.top * MODEL_SCALE + 0.45 }
  })
  // Clicking the home island's grass means "go home": to the shack
  const homeIndex = specs.findIndex((s) => s.kind === 'shack')
  tag(home.group, homeIndex)

  const garden = buildGarden(mats, random)
  garden.position.set(-1.05, 0, 0.25)
  garden.scale.setScalar(1.15)
  scene.add(garden)
  tag(garden, homeIndex)
  keepClear.push({ x: -1.05, z: 0.35, r: 0.95 }, { x: 0.4, z: 0, r: 0.5 })

  // Two small planes parked by the hangar
  const hangarIndex = specs.findIndex((s) => s.kind === 'hangar')
  for (const [x, z, h, mat] of [
    [2.5, -0.15, -2.2, mats.body2],
    [2.35, 0.95, -1.4, mats.cloth],
  ]) {
    const small = buildPlane(mats, mat, 0.62)
    small.group.position.set(x, 0, z)
    small.group.rotation.y = h
    scene.add(small.group)
    if (hangarIndex >= 0) tag(small.group, hangarIndex)
    keepClear.push({ x, z, r: 0.45 })
  }
  const homeLamp = buildLamp(mats)
  homeLamp.group.position.set(0.2, 0, 1.55)
  scene.add(homeLamp.group)
  lamps.push(homeLamp)
  keepClear.push({ x: 0.2, z: 1.55, r: 0.15 })

  // Trees, rocks and grass on every island, kept clear of the models and strips
  const trees = []
  const blades = []
  islands.forEach((isle) => {
    const want = isle === home ? 7 : 6
    for (let tries = 0, grown = 0; grown < want && tries < 200; tries++) {
      const a = random() * Math.PI * 2
      const d = 0.6 + random() * (isle.r - 0.9)
      const x = isle.x + Math.cos(a) * d
      const z = isle.z + Math.sin(a) * d
      if (!clearAt(x, z, 0.45) || trees.some((t) => Math.hypot(t.x - x, t.z - z) < 0.75)) continue
      grown++
      const scale = 0.65 + random() * 0.55
      const group = new Group()
      group.position.set(x, isle.y, z)
      if (random() < 0.8) {
        const crown = new Mesh(new ConeGeometry(0.38, 1, 6), mats.tree)
        crown.position.y = 0.85
        const crown2 = new Mesh(new ConeGeometry(0.3, 0.7, 6), mats.tree)
        crown2.position.y = 1.2
        const trunk = new Mesh(new CylinderGeometry(0.07, 0.09, 0.4, 5), mats.trunk)
        trunk.position.y = 0.2
        crown.castShadow = crown2.castShadow = trunk.castShadow = true
        group.add(crown, crown2, trunk)
      } else {
        const stone = new Mesh(new DodecahedronGeometry(0.3, 0), mats.rock)
        stone.position.y = 0.18
        stone.castShadow = true
        group.add(stone)
      }
      group.scale.setScalar(scale)
      group.rotation.y = random() * Math.PI
      scene.add(group)
      tag(group, isle === home ? homeIndex : isle.landmarks[0])
      trees.push({ x, z })
      keepClear.push({ x, z, r: 0.25 * scale })
    }
    for (let tries = 0, tufts = 0; tufts < (isle === home ? 45 : 22) && tries < 300; tries++) {
      const a = random() * Math.PI * 2
      const d = Math.sqrt(random()) * (isle.r - 0.25)
      const x = isle.x + Math.cos(a) * d
      const z = isle.z + Math.sin(a) * d
      if (!clearAt(x, z, 0.08)) continue
      tufts++
      for (let b = 0; b < 3; b++) blades.push([x + (random() - 0.5) * 0.08, isle.y, z + (random() - 0.5) * 0.08, (random() - 0.5) * 0.5, 0.7 + random() * 0.6])
    }
  })
  const bladeGeo = new ConeGeometry(0.035, 0.2, 4)
  bladeGeo.translate(0, 0.1, 0)
  const grass = new InstancedMesh(bladeGeo, mats.grass, blades.length)
  const placer = new Object3D()
  blades.forEach(([x, y, z, tilt, s], i) => {
    placer.position.set(x, y, z)
    placer.rotation.set(tilt * 0.6, random() * Math.PI, tilt)
    placer.scale.set(1, s, 1)
    placer.updateMatrix()
    grass.setMatrixAt(i, placer.matrix)
  })
  scene.add(grass)

  // Rings that light up under a landmark's model when the plane is parked there
  landmarks.forEach((l) => {
    const ring = new Mesh(new TorusGeometry(0.95, 0.03, 6, 48), glow)
    ring.rotation.x = Math.PI / 2
    ring.position.set(l.model.group.position.x, l.y + 0.03, l.model.group.position.z)
    ring.visible = false
    scene.add(ring)
    l.ring = ring
  })

  // Low clouds drifting in the gaps between islands, under the plane's flying height
  const clouds = Array.from({ length: Math.max(3, n) }, (_, k) => {
    const c = buildCloud(mats, random)
    const a = Math.PI / 2 - (k * 2 * Math.PI) / Math.max(3, n)
    c.userData = { a, r: RING * 0.62 + random() * 0.8, y: 0.7 + random() * 0.5, speed: 0.1 + random() * 0.08 }
    c.scale.setScalar(0.8)
    scene.add(c)
    return c
  })

  // Pebbles floating under the islands
  const floaters = islands.flatMap((isle) =>
    Array.from({ length: 2 }, () => {
      const a = random() * Math.PI * 2
      const m = new Mesh(new DodecahedronGeometry(0.15 + random() * 0.2, 0), mats.rock)
      m.position.set(isle.x + Math.cos(a) * (isle.r + 0.5), isle.y - 1 - random() * 1.2, isle.z + Math.sin(a) * (isle.r + 0.4))
      m.userData.phase = random() * 6
      scene.add(m)
      return m
    }),
  )

  // Fireflies over the garden, only out at night
  const flyCount = 22
  const flyHome = new Float32Array(flyCount * 3)
  for (let i = 0; i < flyCount; i++) {
    const a = random() * Math.PI * 2
    const d = 0.4 + random() * (HOME_R - 0.6)
    flyHome.set([Math.cos(a) * d, 0.3 + random() * 1.1, Math.sin(a) * d], i * 3)
  }
  const flyGeo = new BufferGeometry()
  flyGeo.setAttribute('position', new BufferAttribute(flyHome.slice(), 3))
  const flyMat = new PointsMaterial({ color: 0xffd98a, size: 0.09, transparent: true, opacity: 0.9, depthWrite: false, blending: AdditiveBlending })
  const fireflies = new Points(flyGeo, flyMat)
  fireflies.visible = false
  scene.add(fireflies)

  // The plane, and the puffs it leaves: a thin trail in the air, dust when it touches down
  const plane = buildPlane(mats, mats.body, 1)
  scene.add(plane.group)
  plane.group.rotation.order = 'YXZ'
  const puffs = Array.from({ length: 18 }, () => {
    const p = new Mesh(new IcosahedronGeometry(0.07, 0), mats.steam)
    p.visible = false
    p.userData = { life: 0, max: 1, grow: 1, rise: 0, size: 1 }
    scene.add(p)
    return p
  })
  let puffIndex = 0
  function puff(x, y, z, { max = 0.9, grow = 1.6, rise = 0.15, size = 1 } = {}) {
    if (reduced) return
    const p = puffs[puffIndex++ % puffs.length]
    p.position.set(x, y, z)
    p.visible = true
    p.scale.setScalar(size)
    Object.assign(p.userData, { life: 0, max, grow, rise, size })
  }

  // ----- State -----
  const pos = new Vector3() // x, altitude, z
  let heading = 0
  let pitch = 0
  let roll = 0
  let speed = 0
  let mode = 'parked' // parked | takeoff | cruise | landing | rollout
  let at = -1 // the landmark the plane is parked at
  let goal = -1 // where the autopilot is headed
  let script = null // the takeoff or landing in progress
  let trailClock = 0
  const input = new Vector2() // x: turn (−1 left … 1 right), y: throttle (−1 faster … 1 slower)
  let near = -1
  let hover = -1
  let arrive = 0
  let frame = { focusX: 0.5, width: 1 }
  let size = { w: 1, h: 1 }
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
  const look = new Vector3()
  const lookAt = new Vector3()
  const camPos = new Vector3()
  let running = false
  let raf = 0
  let then = 0
  let clock = 0
  let dirty = true

  const raycaster = new Raycaster()
  const ndc = new Vector2()
  const tmp = new Vector3()
  const tmp2 = new Vector2()
  const ahead = new Vector2()

  function setNear(i) {
    if (i === near) return
    near = i
    onNear?.(near)
  }

  function park(i) {
    const l = landmarks[i]
    pos.set(l.spot.x, l.y, l.spot.y)
    heading = headingOf(l.dir.x, l.dir.y)
    pitch = roll = speed = 0
    mode = 'parked'
    at = i
    script = null
    setNear(i)
  }

  // Camera distance so VIEW world units fill `frame.width` of the canvas, whatever its shape
  function cameraDistance() {
    const tan = Math.tan(((FOV / 2) * Math.PI) / 180)
    const aspect = size.w / size.h
    const view = frame.view ?? VIEW
    return Math.max(view / (frame.width * 2 * tan * aspect), (view * 0.72) / (2 * tan))
  }

  function resize(w, h, dpr = Math.min(window.devicePixelRatio || 1, 1.75)) {
    size = { w: Math.max(1, w), h: Math.max(1, h) }
    renderer.setPixelRatio(dpr)
    renderer.setSize(size.w, size.h, false)
    camera.aspect = size.w / size.h
    // Slide the view so the world sits at frame.focusX across the canvas
    camera.setViewOffset(size.w, size.h, (0.5 - frame.focusX) * size.w, 0, size.w, size.h)
    camera.updateProjectionMatrix()
    dirty = true
  }

  function setFrame(next) {
    frame = { ...frame, ...next }
    resize(size.w, size.h, renderer.getPixelRatio())
  }

  // Light mode is a sunny afternoon; dark mode is night, with the lamps and windows lit
  function setTheme(c, dark) {
    const nat = dark ? NATURE.night : NATURE.day
    const col = (v) => new Color(v)
    mats.top.color.copy(col(c.surface).lerp(col(nat.grass), dark ? 0.55 : 0.42))
    mats.grass.color.copy(col(nat.grass).lerp(col(c.fg), dark ? 0.04 : 0.12))
    mats.side.color.copy(col(c.line).lerp(col(c.fg), dark ? 0.06 : 0.14))
    mats.rock.color.copy(col(c.line).lerp(col(c.fg), dark ? 0.12 : 0.22))
    mats.path.color.copy(col(nat.path))
    mats.soil.color.copy(col(nat.soil))
    mats.stone.color.copy(col(nat.path).lerp(col(c.fg), 0.25))
    mats.tree.color.copy(col(nat.tree))
    mats.trunk.color.copy(col(c.muted).lerp(col(c.fg), 0.3))
    mats.roof.color.copy(col(c.fg).lerp(col(c.accent), 0.25).lerp(col(c.surface), dark ? 0.55 : 0.25))
    mats.dark.color.copy(col(dark ? '#2a2724' : '#3a3632'))
    mats.accent.color.copy(col(c.accent))
    mats.body.color.copy(col(c.accent))
    mats.body2.color.copy(col(dark ? '#6f7f95' : '#8fa3bd'))
    mats.wood.color.copy(col(dark ? '#5a4a3c' : '#9a7b5c'))
    mats.cloth.color.copy(col(dark ? '#c9c2b8' : '#fbf8f2'))
    mats.metal.color.copy(col(dark ? '#7d7b78' : '#a9a6a0'))
    mats.steam.color.copy(col(dark ? '#8a8f99' : '#ffffff'))
    mats.cloud.color.copy(col(nat.cloud))
    mats.cloud.opacity = dark ? 0.55 : 0.92
    mats.window.color.copy(col(dark ? '#3d3427' : '#efe6d4'))
    mats.window.emissiveIntensity = dark ? 1.6 : 0.12
    mats.screen.color.copy(col(dark ? '#1d2a33' : '#cfe3ef'))
    mats.screen.emissiveIntensity = dark ? 1.3 : 0.25
    glow.color.copy(col(c.accent))
    wallMats.forEach((m, i) => m.color.copy(dark ? col(specs[i].tone).multiplyScalar(0.55) : col(specs[i].tone).lerp(col(c.fg), 0.04)))
    hemi.color.set(nat.sky)
    hemi.groundColor.set(nat.ground)
    hemi.intensity = dark ? 1.25 : 1.6
    sun.color.set(nat.sun)
    sun.intensity = dark ? 1.05 : 2.1
    lamps.forEach((l) => {
      l.light.intensity = dark ? 2.6 : 0
      l.light.visible = dark
    })
    fireflies.visible = dark && !reduced
    dirty = true
  }

  // ----- Flight -----

  // Where the landing curve touches down: a little before the parking spot, on the strip
  const touchdown = (l, out = new Vector2()) => out.set(l.spot.x - l.dir.x * 1.25, l.spot.y - l.dir.y * 1.25)

  function startTakeoff() {
    // Turn toward the destination before the takeoff run, unless it lies ahead past the landmark
    // the plane is facing; then (and when steering by hand) turn around and take off back along the strip
    let swing = Math.PI
    if (goal >= 0) {
      const l = landmarks[goal]
      const td = touchdown(l, tmp2)
      const toward = turnBy(heading, headingOf(td.x - l.dir.x * 2.4 - pos.x, td.y - l.dir.y * 2.4 - pos.z))
      if (Math.abs(toward) > 1.2) swing = toward
    }
    script = { kind: 'takeoff', t: 0, swing, from: { x: pos.x, y: pos.y, z: pos.z, h: heading } }
    mode = 'takeoff'
    at = -1
    setNear(-1)
  }

  function startLanding(i) {
    const l = landmarks[i]
    const td = touchdown(l)
    const p0 = new Vector2(pos.x, pos.z)
    const reach = clamp(p0.distanceTo(td) * 0.4, 1.2, 3)
    const fwd = new Vector2(Math.sin(heading), Math.cos(heading))
    const curve = [p0, p0.clone().addScaledVector(fwd, reach), td.clone().addScaledVector(l.dir, -reach), td]
    // Rough length, for a duration that keeps the speed believable
    let len = 0
    const prev = p0.clone()
    const pt = new Vector2()
    for (let s = 1; s <= 12; s++) {
      bezier(...curve, s / 12, pt)
      len += pt.distanceTo(prev)
      prev.copy(pt)
    }
    script = { kind: 'landing', t: 0, dur: clamp(len / Math.max(3.4, speed * 0.9), 1.1, 2.6), curve, alt0: pos.y, i }
    mode = 'landing'
    goal = i
  }

  // Fly to landmark i and land there
  function goTo(i) {
    if (!landmarks[i]) return
    if (reduced) {
      // No flight: the plane is simply there
      goal = -1
      park(i)
      dirty = true
      start()
      return
    }
    if (mode === 'parked' && at === i) return
    goal = i
    input.set(0, 0)
    if (mode === 'parked') startTakeoff()
    start()
  }

  // Land at whichever landmark the plane is over, if any (for keyboard flying)
  function land() {
    if (mode !== 'cruise') return false
    let best = -1
    let bestD = Infinity
    landmarks.forEach((l, i) => {
      const d = Math.hypot(pos.x - l.island.x, pos.z - l.island.z)
      const s = Math.hypot(pos.x - l.spot.x, pos.z - l.spot.y)
      if (d < l.island.r + 1.6 && s < bestD) {
        best = i
        bestD = s
      }
    })
    if (best < 0) return false
    input.set(0, 0)
    startLanding(best)
    start()
    return true
  }

  function setInput(x, y) {
    input.set(x, y)
    if (x || y) {
      goal = -1
      if (mode === 'parked' && !reduced) startTakeoff()
    }
    start()
  }

  function setHover(i) {
    if (i === hover) return
    hover = i
    start()
  }

  function setPointer(x, y) {
    pointer.tx = x
    pointer.ty = y
    start()
  }

  // A click or tap at canvas coordinates. Returns the landmark's index, or null for empty sky
  function pick(x, y, act = true) {
    ndc.set((x / size.w) * 2 - 1, -(y / size.h) * 2 + 1)
    raycaster.setFromCamera(ndc, camera)
    const [first] = raycaster.intersectObjects(pickables, false)
    if (!first) return null
    const i = first.object.userData.landmark
    if (act) onPick?.(i)
    return i
  }

  const bank = (turnRate) => clamp(-turnRate * 0.32, -0.6, 0.6)

  function fly(dt) {
    const s = dt / 1000
    if (mode === 'parked') return false

    if (mode === 'takeoff') {
      const { from, swing } = script
      script.t += s
      const turn = 0.2 + 0.3 * (Math.abs(swing) / Math.PI)
      const run = 0.95
      if (script.t < turn) {
        // Turn on the spot toward the way out
        const k = easeInOut(script.t / turn)
        heading = from.h + swing * k
        pos.set(from.x + Math.sin(heading) * 0.12 * k, from.y, from.z + Math.cos(heading) * 0.12 * k)
        speed = 0.5
      } else {
        // Roll, lift off and climb
        const k = Math.min(1, (script.t - turn) / run)
        heading = from.h + swing
        const along = 0.12 + 2.4 * k * k
        const lift = k < 0.35 ? 0 : easeInOut((k - 0.35) / 0.65)
        pos.set(from.x + Math.sin(heading) * along, from.y + lift * (CRUISE - from.y) * 0.7, from.z + Math.cos(heading) * along)
        pitch = 0.28 * Math.sin(Math.PI * Math.min(1, lift * 1.4))
        speed = 1 + 3 * k
        if (k > 0.15 && k < 0.45 && Math.random() < 0.35) puff(pos.x - Math.sin(heading) * 0.3, from.y + 0.05, pos.z - Math.cos(heading) * 0.3, { rise: 0.05 })
        if (k >= 1) {
          mode = 'cruise'
          script = null
          speed = SPEED.auto
        }
      }
      return true
    }

    if (mode === 'landing') {
      const { curve, alt0, dur, i } = script
      const l = landmarks[i]
      script.t += s
      const u = Math.min(1, script.t / dur)
      const p = bezier(...curve, u, tmp2)
      bezier(...curve, Math.min(1, u + 0.02), ahead)
      const prevHeading = heading
      if (u > 0.98) heading = headingOf(l.dir.x, l.dir.y)
      else if (ahead.distanceTo(p) > 1e-4) heading = headingOf(ahead.x - p.x, ahead.y - p.y)
      const descend = easeInOut(clamp((u - 0.15) / 0.85, 0, 1))
      pos.set(p.x, alt0 + (l.y - alt0) * descend, p.y)
      // Nose down on the approach, then up for the flare just before the wheels touch
      pitch = -0.12 * Math.sin(Math.PI * clamp(u * 1.3, 0, 1)) + (u > 0.82 ? 0.14 * Math.sin(((u - 0.82) / 0.18) * Math.PI) : 0)
      roll = bank(turnBy(prevHeading, heading) / Math.max(s, 1e-3)) * (1 - u)
      if (u >= 1) {
        for (let k = 0; k < 6; k++) puff(pos.x + (Math.random() - 0.5) * 0.4, l.y + 0.04, pos.z + (Math.random() - 0.5) * 0.4, { max: 0.8, grow: 2.2, rise: 0.12 })
        mode = 'rollout'
        script = { kind: 'rollout', t: 0, from: new Vector2(pos.x, pos.z), i }
        pitch = roll = 0
      }
      return true
    }

    if (mode === 'rollout') {
      const l = landmarks[script.i]
      script.t += s
      const k = Math.min(1, script.t / 0.7)
      const e = easeOut(k)
      // A small bounce on the wheels, then rolling to a stop at the spot
      const bounce = 0.07 * Math.max(0, Math.sin(Math.PI * Math.min(1, k / 0.28))) * (1 - k)
      pos.set(script.from.x + (l.spot.x - script.from.x) * e, l.y + bounce, script.from.y + (l.spot.y - script.from.y) * e)
      heading = headingOf(l.dir.x, l.dir.y)
      speed = 2 * (1 - e)
      pitch = -0.04 * Math.sin(Math.PI * Math.min(1, k / 0.28))
      if (k >= 1) {
        const i = script.i
        park(i)
        // A new destination picked while landing: off again
        if (goal >= 0 && goal !== i) startTakeoff()
        else goal = -1
      }
      return true
    }

    // Cruise
    let turnRate = 0
    let wantSpeed = SPEED.auto
    if (input.lengthSq() > 0) {
      turnRate = -input.x * TURN
      if (input.y < 0) wantSpeed = SPEED.max
      if (input.y > 0) wantSpeed = SPEED.min
    } else if (goal >= 0) {
      // Aim for a point on the approach line, then hand over to the landing curve
      const l = landmarks[goal]
      const td = touchdown(l, tmp2)
      const ax = td.x - l.dir.x * 2.4
      const az = td.y - l.dir.y * 2.4
      turnRate = clamp(turnBy(heading, headingOf(ax - pos.x, az - pos.z)) * 3, -TURN, TURN)
      if (Math.hypot(ax - pos.x, az - pos.z) < 2) {
        startLanding(goal)
        return true
      }
    }
    // Past the edge of the archipelago, turn back toward home (keys can only push a little further)
    const out = Math.hypot(pos.x, pos.z)
    if ((out > BOUNDS && input.lengthSq() === 0) || out > BOUNDS + 2) turnRate = clamp(turnBy(heading, headingOf(-pos.x, -pos.z)) * 2, -TURN, TURN)

    heading += turnRate * s
    speed += (wantSpeed - speed) * smooth(dt, 500)
    const climb = (CRUISE - pos.y) * smooth(dt, 700)
    pos.y += climb
    pos.x += Math.sin(heading) * speed * s
    pos.z += Math.cos(heading) * speed * s
    roll += (bank(turnRate) - roll) * smooth(dt, 180)
    pitch += (clamp(climb / Math.max(s, 1e-3) / 6, -0.2, 0.25) - pitch) * smooth(dt, 200)

    trailClock += dt
    if (trailClock > 90) {
      trailClock = 0
      puff(pos.x - Math.sin(heading) * 0.5, pos.y + 0.26, pos.z - Math.cos(heading) * 0.5, { max: 0.9, grow: 0.8, rise: 0, size: 0.6 })
    }
    return true
  }

  const liftFor = (i) => (i === near ? 1 : i === hover ? 0.45 : 0)

  function animate(dt) {
    clock += dt / 1000
    const t = reduced ? 0 : clock
    const k = smooth(dt, 140)
    let ringGlow = 0
    landmarks.forEach((l, i) => {
      l.lift += (liftFor(i) - l.lift) * k
      l.glow += (liftFor(i) - l.glow) * k
      ringGlow = Math.max(ringGlow, l.glow)
      l.model.group.scale.setScalar(MODEL_SCALE * (1 + l.lift * 0.05))
      l.model.update(t, l.lift)
      l.ring.visible = l.glow > 0.02
      l.ring.scale.setScalar(1 + (1 - l.glow) * 0.2)
    })
    glow.opacity = ringGlow * 0.8

    // The plane
    plane.group.position.copy(pos)
    plane.group.rotation.set(-pitch, heading, roll)
    if (!reduced || mode !== 'parked') plane.prop.rotation.z += (dt / 1000) * (mode === 'parked' ? 4 : 28)

    puffs.forEach((p) => {
      if (!p.visible) return
      const u = p.userData
      u.life += dt / 1000
      const k2 = u.life / u.max
      if (k2 >= 1) {
        p.visible = false
        return
      }
      p.scale.setScalar(u.size * (1 + k2 * u.grow) * (1 - k2 * k2))
      p.position.y += u.rise * (dt / 1000)
    })

    if (!reduced) {
      floaters.forEach((f) => (f.position.y += Math.sin(clock * 0.9 + f.userData.phase) * 0.0015))
      clouds.forEach((c) => {
        const { a, r, y, speed: cs } = c.userData
        const angle = a + Math.sin(clock * cs + a) * 0.2
        c.position.set(Math.cos(angle) * r, y + Math.sin(clock * 0.3 + a) * 0.08, Math.sin(angle) * r)
        c.rotation.y = -angle
      })
      if (fireflies.visible) {
        const p = flyGeo.attributes.position
        for (let i = 0; i < flyCount; i++) {
          p.setXYZ(
            i,
            flyHome[i * 3] + Math.sin(clock * 0.7 + i) * 0.3,
            flyHome[i * 3 + 1] + Math.sin(clock * 1.3 + i * 2) * 0.15,
            flyHome[i * 3 + 2] + Math.cos(clock * 0.6 + i * 1.7) * 0.3,
          )
        }
        p.needsUpdate = true
        flyMat.opacity = 0.55 + Math.sin(clock * 3) * 0.3
      }
    } else if (!clouds[0].userData.placed) {
      clouds.forEach((c) => {
        const { a, r, y } = c.userData
        c.position.set(Math.cos(a) * r, y, Math.sin(a) * r)
        c.userData.placed = true
      })
    }

    // Camera: follows the plane, leans toward the pointer, and eases in on a landmark once parked there
    pointer.x += (pointer.tx - pointer.x) * smooth(dt, 220)
    pointer.y += (pointer.ty - pointer.y) * smooth(dt, 220)
    // Parked at a project's island the camera closes in on it; at home it stays wide enough to see the way out
    const l = landmarks[at]
    const awayFromHome = l && l.island !== home
    arrive += ((mode === 'parked' && !reduced ? (awayFromHome ? 1 : 0.3) : 0) - arrive) * smooth(dt, 500)
    const dist = cameraDistance() * (1 - 0.42 * arrive)
    lookAt.set(pos.x * 0.8, 0.3, pos.z * 0.8 - 0.4)
    if (l) {
      const focus = awayFromHome ? tmp.set(l.island.x, l.y + 0.4, l.island.z) : tmp.set(l.model.group.position.x, l.y + 0.4, l.model.group.position.z + 0.6)
      lookAt.lerp(focus, Math.min(1, 0.9 * arrive * (awayFromHome ? 1 : 2)))
    }
    if (look.lengthSq() === 0 || reduced) look.copy(lookAt)
    else look.lerp(lookAt, smooth(dt, 380))
    // A fairly steep angle, so nearer islands don't hide the one you're looking at
    tmp.set(look.x + pointer.x * 1.6, look.y + dist * 0.74 - pointer.y * 1.2, look.z + dist * 0.67)
    if (camPos.lengthSq() === 0 || reduced) camPos.copy(tmp)
    else camPos.lerp(tmp, smooth(dt, 380))
    camera.position.copy(camPos)
    camera.lookAt(look)
    sun.target.position.copy(look)
    sun.position.set(look.x - 6, look.y + 12, look.z + 7)
  }

  function render() {
    renderer.render(scene, camera)
    dirty = false
    if (onFrame) {
      const points = landmarks.map((l) => {
        const g = l.model.group.position
        tmp.set(g.x, l.labelY + l.lift * 0.1, g.z).project(camera)
        return { x: (tmp.x * 0.5 + 0.5) * size.w, y: (-tmp.y * 0.5 + 0.5) * size.h }
      })
      onFrame(points)
    }
  }

  function settled() {
    return (
      mode === 'parked' &&
      input.lengthSq() === 0 &&
      puffs.every((p) => !p.visible) &&
      Math.abs(pointer.tx - pointer.x) < 0.001 &&
      Math.abs(pointer.ty - pointer.y) < 0.001 &&
      landmarks.every((l, i) => Math.abs(l.lift - liftFor(i)) < 0.002)
    )
  }

  function loop(now) {
    raf = 0
    if (!running) return
    const dt = then ? Math.min(now - then, 50) : 16
    then = now
    const moved = fly(dt)
    animate(dt)
    render()
    // With reduced motion nothing idles: stop as soon as everything has come to rest
    if (!reduced || moved || !settled() || dirty) raf = requestAnimationFrame(loop)
    else then = 0
  }

  function start() {
    running = true
    if (!raf) raf = requestAnimationFrame(loop)
  }

  function stop() {
    running = false
    cancelAnimationFrame(raf)
    raf = 0
    then = 0
  }

  function dispose() {
    stop()
    scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose()
    })
    Object.values(mats).forEach((m) => m.dispose())
    wallMats.forEach((m) => m.dispose())
    ;[glow, flyMat].forEach((m) => m.dispose())
    grass.dispose()
    renderer.dispose()
  }

  // Start parked at home, then a slow glide in from further out
  park(landmarks[start] ? start : homeIndex)
  animate(16)
  if (!reduced) camPos.multiplyScalar(1.6)

  return {
    resize,
    setFrame,
    setTheme,
    setInput,
    setPointer,
    setHover,
    goTo,
    land,
    pick,
    start,
    stop,
    dispose,
    get near() {
      return near
    },
  }
}
