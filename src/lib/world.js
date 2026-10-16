// The hero's little world: a floating island with one landmark per project and a ball you roll between them.
// Plain three.js with no React, loaded on its own after the page has painted (see HeroWorld.jsx).
// The landmark models, lamps and clouds live in world-props.js.
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CircleGeometry,
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
  Plane,
  Points,
  PointsMaterial,
  Quaternion,
  Raycaster,
  Scene,
  TorusGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three'
import { buildCloud, buildLamp, buildLandmark } from './world-props'

const ISLAND = 6.2 // radius of the island's flat top
const RING = 3.75 // how far from the middle the landmarks stand
const PAD = 0.85 // radius of a landmark's pedestal
const PAD_TOP = 0.24
const MODEL_SCALE = 1.3 // the models are built at a desk-toy scale; this sizes them to their pedestals
const BALL = 0.42 // radius of the ball
const NEAR = PAD + BALL + 0.75 // close enough to "arrive" at a landmark
const PLAZA = 0.95 // the paved circle in the middle
const MAX_SPEED = 5.2
const FOV = 30

// Natural colours the theme's neutrals are tinted toward, by day and by night
const NATURE = {
  day: { grass: '#b9c49f', tree: '#7d9169', path: '#d8cdb8', sky: 0xfff3e2, ground: 0x8a8478, sun: 0xfff1dd, cloud: '#ffffff' },
  night: { grass: '#3a4636', tree: '#2c3a2c', path: '#4a4640', sky: 0x8796c4, ground: 0x15171d, sun: 0xa9b6ff, cloud: '#5d6580' },
}

// Small seeded random, so the trees grow in the same places on every visit
function seeded(seed) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
}

const smooth = (dt, ms) => 1 - Math.exp(-dt / ms)

// Distance from (x, z) to the straight path between the middle and a landmark
function pathOffset(x, z, l) {
  const len = Math.hypot(l.x, l.z)
  const along = (x * l.x + z * l.z) / len
  const off = Math.abs(x * l.z - z * l.x) / len
  return along < 0 || along > len ? Infinity : off
}

// `landmarks`: [{ kind, tone }], one per landmark, the first one at the front
export function createWorld(canvas, { landmarks: specs, reduced = false, onFrame, onNear, onPick }) {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' })
  renderer.setClearColor(0x000000, 0)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = PCFSoftShadowMap

  const scene = new Scene()
  const camera = new PerspectiveCamera(FOV, 1, 0.5, 120)

  const hemi = new HemisphereLight(0xffffff, 0x8a8478, 1.6)
  const sun = new DirectionalLight(0xffffff, 2.1)
  sun.position.set(-6, 12, 7)
  sun.castShadow = true
  sun.shadow.mapSize.set(1024, 1024)
  Object.assign(sun.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: 2, far: 34 })
  sun.shadow.bias = -0.0006
  scene.add(hemi, sun)

  const flat = (extra) => new MeshStandardMaterial({ roughness: 0.92, metalness: 0, flatShading: true, ...extra })
  const mats = {
    top: flat(),
    side: flat(),
    rock: flat(),
    pad: flat(),
    tree: flat(),
    trunk: flat(),
    ball: flat(),
    band: flat(),
    grass: flat(),
    path: flat(),
    // Shared by the landmarks
    roof: flat(),
    dark: flat(),
    accent: flat(),
    wood: flat(),
    cloth: flat(),
    metal: flat({ roughness: 0.6, metalness: 0.2 }),
    stone: flat(),
    steam: flat({ transparent: true, opacity: 0.75 }),
    cloud: flat({ transparent: true, opacity: 0.92 }),
    // Windows, bulbs and screens: lit from inside, much brighter at night
    window: flat({ emissive: new Color('#ffcf8a') }),
    screen: flat({ emissive: new Color('#9fd3ff') }),
  }
  const glow = new MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
  const marker = new MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
  const wallMats = specs.map(() => flat())

  // The island: a flat top over a faceted rock that tapers to a point
  const island = new Group()
  const top = new Mesh(new CylinderGeometry(ISLAND, ISLAND * 0.97, 0.5, 60), [mats.side, mats.top, mats.side])
  top.position.y = -0.25
  top.receiveShadow = true
  const rock = new Mesh(new ConeGeometry(ISLAND * 0.97, 3.4, 10, 2), mats.rock)
  rock.rotation.x = Math.PI
  rock.position.y = -0.5 - 1.7
  island.add(top, rock)
  scene.add(island)

  // The paved plaza in the middle, where the ball starts
  const plaza = new Mesh(new CylinderGeometry(PLAZA, PLAZA, 0.02, 32), mats.path)
  plaza.position.y = 0.01
  plaza.receiveShadow = true
  scene.add(plaza)

  // A few pebbles floating under the island
  const random = seeded(7)
  const floaters = []
  for (let i = 0; i < 4; i++) {
    const a = random() * Math.PI * 2
    const m = new Mesh(new DodecahedronGeometry(0.25 + random() * 0.3, 0), mats.rock)
    m.position.set(Math.cos(a) * (ISLAND + 0.8 + random() * 1.5), -1.4 - random() * 1.8, Math.sin(a) * (ISLAND + 0.6))
    m.userData.phase = random() * 6
    floaters.push(m)
    scene.add(m)
  }

  // Landmarks, evenly around the ring, each turned to face the middle
  const pickables = []
  const colliders = []
  const count = specs.length
  const landmarks = specs.map((spec, i) => {
    const a = Math.PI / 2 - (i / count) * Math.PI * 2
    const x = Math.cos(a) * RING
    const z = Math.sin(a) * RING
    const group = new Group()
    group.position.set(x, 0, z)
    group.lookAt(0, 0, 0)

    const pad = new Mesh(new CylinderGeometry(PAD, PAD + 0.08, PAD_TOP, 24), mats.pad)
    pad.position.y = PAD_TOP / 2
    pad.castShadow = pad.receiveShadow = true
    const model = buildLandmark(spec.kind, mats, wallMats[i])
    model.group.position.y = PAD_TOP
    model.group.scale.setScalar(MODEL_SCALE)
    const ring = new Mesh(new TorusGeometry(PAD + 0.28, 0.035, 6, 48), glow)
    ring.rotation.x = Math.PI / 2
    ring.position.y = 0.02
    group.add(pad, model.group, ring)
    scene.add(group)

    pad.userData.project = i
    pickables.push(pad)
    model.group.traverse((o) => {
      if (!o.isMesh) return
      o.userData.project = i
      pickables.push(o)
    })
    colliders.push({ x, z, r: PAD + 0.04 })
    return { group, model, ring, x, z, a, lift: 0, glow: 0, labelY: PAD_TOP + model.top * MODEL_SCALE + 0.35 }
  })

  // Stepping stones from the plaza to each landmark
  const stoneGeo = new CylinderGeometry(0.17, 0.18, 0.03, 7)
  const stoneSpots = []
  landmarks.forEach((l) => {
    const len = Math.hypot(l.x, l.z)
    const ux = l.x / len
    const uz = l.z / len
    for (let d = PLAZA + 0.25; d < len - PAD - 0.15; d += 0.42) {
      const side = (random() - 0.5) * 0.14
      stoneSpots.push([ux * d - uz * side, uz * d + ux * side, random() * Math.PI])
    }
  })
  const stones = new InstancedMesh(stoneGeo, mats.path, stoneSpots.length)
  const placer = new Object3D()
  stoneSpots.forEach(([x, z, r], i) => {
    placer.position.set(x, 0.015, z)
    placer.rotation.set(0, r, 0)
    placer.updateMatrix()
    stones.setMatrixAt(i, placer.matrix)
  })
  stones.receiveShadow = true
  scene.add(stones)

  // A lamp beside each path, halfway along
  const lamps = landmarks.map((l) => {
    const len = Math.hypot(l.x, l.z)
    const d = (PLAZA + len - PAD) / 2
    const ux = l.x / len
    const uz = l.z / len
    const lamp = buildLamp(mats)
    // Far enough to the side that the ball rolls past without touching it
    const x = ux * d + uz * 0.78
    const z = uz * d - ux * 0.78
    lamp.group.position.set(x, 0, z)
    scene.add(lamp.group)
    colliders.push({ x, z, r: 0.08 })
    return lamp
  })

  const clear = (x, z, room) =>
    Math.hypot(x, z) > PLAZA + room &&
    landmarks.every((l) => Math.hypot(l.x - x, l.z - z) > PAD + room + 0.2 && pathOffset(x, z, l) > room + 0.25) &&
    colliders.every((c) => Math.hypot(c.x - x, c.z - z) > c.r + room)

  // Trees and rocks, kept clear of the landmarks, the paths and the plaza
  const trees = []
  for (let tries = 0; trees.length < 16 && tries < 500; tries++) {
    const a = random() * Math.PI * 2
    const d = 1.6 + random() * (ISLAND - 2.2)
    const x = Math.cos(a) * d
    const z = Math.sin(a) * d
    if (!clear(x, z, 0.6)) continue
    const scale = 0.7 + random() * 0.6
    const group = new Group()
    group.position.set(x, 0, z)
    if (random() < 0.75) {
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
    const tree = { group, x, z, r: 0.3 * scale, wobble: 0, wobbleV: 0, axis: new Vector3(1, 0, 0) }
    trees.push(tree)
    colliders.push(tree)
  }

  // Grass: little tufts of three blades, all one instanced mesh
  const bladeGeo = new ConeGeometry(0.035, 0.2, 4)
  bladeGeo.translate(0, 0.1, 0)
  const blades = []
  for (let tries = 0; blades.length < 210 && tries < 900; tries++) {
    const a = random() * Math.PI * 2
    const d = Math.sqrt(random()) * (ISLAND - 0.35)
    const x = Math.cos(a) * d
    const z = Math.sin(a) * d
    if (!clear(x, z, 0.12)) continue
    for (let b = 0; b < 3; b++) blades.push([x + (random() - 0.5) * 0.08, z + (random() - 0.5) * 0.08, (random() - 0.5) * 0.5, 0.7 + random() * 0.6])
  }
  const grass = new InstancedMesh(bladeGeo, mats.grass, blades.length)
  blades.forEach(([x, z, tilt, s], i) => {
    placer.position.set(x, 0, z)
    placer.rotation.set(tilt * 0.6, random() * Math.PI, tilt)
    placer.scale.set(1, s, 1)
    placer.updateMatrix()
    grass.setMatrixAt(i, placer.matrix)
  })
  scene.add(grass)

  // Clouds drifting slowly around the island
  const clouds = Array.from({ length: 3 }, (_, i) => {
    const c = buildCloud(mats, random)
    // Behind the island (the camera looks from +z), swaying a little instead of circling into view
    c.userData = { a: -Math.PI / 2 + (i - 1) * 0.85, r: ISLAND + 0.7 + random() * 0.8, y: 1.5 + random() * 0.9, speed: 0.12 + random() * 0.08 }
    scene.add(c)
    return c
  })

  // Fireflies, only out at night
  const flyCount = 26
  const flyHome = new Float32Array(flyCount * 3)
  for (let i = 0; i < flyCount; i++) {
    const a = random() * Math.PI * 2
    const d = 1.2 + random() * (ISLAND - 1.6)
    flyHome.set([Math.cos(a) * d, 0.3 + random() * 1.2, Math.sin(a) * d], i * 3)
  }
  const flyGeo = new BufferGeometry()
  flyGeo.setAttribute('position', new BufferAttribute(flyHome.slice(), 3))
  const flyMat = new PointsMaterial({ color: 0xffd98a, size: 0.09, transparent: true, opacity: 0.9, depthWrite: false, blending: AdditiveBlending })
  const fireflies = new Points(flyGeo, flyMat)
  fireflies.visible = false
  scene.add(fireflies)

  // The ball, with a band so you can see it roll
  const ball = new Group()
  const body = new Group()
  const sphere = new Mesh(new IcosahedronGeometry(BALL, 1), mats.ball)
  const band = new Mesh(new TorusGeometry(BALL * 1.005, 0.045, 6, 28), mats.band)
  sphere.castShadow = band.castShadow = true
  body.add(sphere, band)
  body.position.y = BALL
  ball.add(body)
  scene.add(ball)

  // Where a click or tap sent the ball
  const ping = new Mesh(new CircleGeometry(0.3, 32), marker)
  ping.rotation.x = -Math.PI / 2
  ping.position.y = 0.03
  scene.add(ping)

  // State
  const pos = new Vector2(0, -0.7)
  const vel = new Vector2()
  const input = new Vector2()
  let target = null
  let goal = -1
  let near = -1
  let hover = -1
  let pingT = 1
  let night = false
  // 0..1: how far the camera has eased in toward the landmark the ball is resting at
  let arrive = 0
  let frame = { focusX: 0.5, width: 1 }
  let size = { w: 1, h: 1 }
  let pointer = { x: 0, y: 0, tx: 0, ty: 0 }
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
  const ground = new Plane(new Vector3(0, 1, 0), 0)
  const hit = new Vector3()
  const q = new Quaternion()
  const axis = new Vector3()
  const tmp = new Vector3()

  // Camera distance so the island fills `frame.width` of the canvas, whatever its shape
  function cameraDistance() {
    const tan = Math.tan(((FOV / 2) * Math.PI) / 180)
    const aspect = size.w / size.h
    const fitWidth = (ISLAND * 2 + 1.6) / (frame.width * 2 * tan * aspect)
    const fitHeight = 15 / (2 * tan)
    return Math.max(fitWidth, fitHeight)
  }

  function resize(w, h, dpr = Math.min(window.devicePixelRatio || 1, 1.75)) {
    size = { w: Math.max(1, w), h: Math.max(1, h) }
    renderer.setPixelRatio(dpr)
    renderer.setSize(size.w, size.h, false)
    camera.aspect = size.w / size.h
    // Slide the view so the island sits at frame.focusX across the canvas
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
    night = dark
    const n = dark ? NATURE.night : NATURE.day
    const col = (v) => new Color(v)
    mats.top.color.copy(col(c.surface).lerp(col(n.grass), dark ? 0.55 : 0.42))
    mats.grass.color.copy(col(n.grass).lerp(col(c.fg), dark ? 0.04 : 0.12))
    mats.side.color.copy(col(c.line).lerp(col(c.fg), dark ? 0.06 : 0.14))
    mats.rock.color.copy(col(c.line).lerp(col(c.fg), dark ? 0.12 : 0.22))
    mats.pad.color.copy(col(c.surface).lerp(col(c.fg), dark ? 0.08 : 0.05))
    mats.path.color.copy(col(n.path))
    mats.stone.color.copy(col(n.path).lerp(col(c.fg), 0.25))
    mats.tree.color.copy(col(n.tree))
    mats.trunk.color.copy(col(c.muted).lerp(col(c.fg), 0.3))
    mats.ball.color.copy(col(c.accent))
    mats.band.color.copy(col(c.fg).lerp(col(c.accent), 0.2))
    mats.roof.color.copy(col(c.fg).lerp(col(c.accent), 0.25).lerp(col(c.surface), dark ? 0.55 : 0.25))
    mats.dark.color.copy(col(dark ? '#2a2724' : '#3a3632'))
    mats.accent.color.copy(col(c.accent))
    mats.wood.color.copy(col(dark ? '#5a4a3c' : '#9a7b5c'))
    mats.cloth.color.copy(col(dark ? '#c9c2b8' : '#fbf8f2'))
    mats.metal.color.copy(col(dark ? '#7d7b78' : '#a9a6a0'))
    mats.steam.color.copy(col(dark ? '#8a8f99' : '#ffffff'))
    mats.cloud.color.copy(col(n.cloud))
    mats.cloud.opacity = dark ? 0.55 : 0.92
    mats.window.color.copy(col(dark ? '#3d3427' : '#efe6d4'))
    mats.window.emissiveIntensity = dark ? 1.6 : 0.12
    mats.screen.color.copy(col(dark ? '#1d2a33' : '#cfe3ef'))
    mats.screen.emissiveIntensity = dark ? 1.3 : 0.25
    glow.color.copy(col(c.accent))
    marker.color.copy(col(c.accent))
    wallMats.forEach((m, i) => m.color.copy(dark ? col(specs[i].tone).multiplyScalar(0.55) : col(specs[i].tone).lerp(col(c.fg), 0.04)))
    hemi.color.set(n.sky)
    hemi.groundColor.set(n.ground)
    hemi.intensity = dark ? 1.25 : 1.6
    sun.color.set(n.sun)
    sun.intensity = dark ? 1.05 : 2.1
    lamps.forEach((l) => {
      l.light.intensity = dark ? 2.6 : 0
      l.light.visible = dark
    })
    fireflies.visible = dark && !reduced
    dirty = true
  }

  function goTo(i) {
    const l = landmarks[i]
    if (!l) return
    goal = i
    // Stop on the side of the pedestal that faces the middle
    const len = Math.hypot(l.x, l.z)
    sendTo(new Vector2(l.x - (l.x / len) * (PAD + BALL + 0.35), l.z - (l.z / len) * (PAD + BALL + 0.35)), false)
  }

  function sendTo(point, showPing = true) {
    target = point
    if (showPing) {
      ping.position.set(point.x, 0.03, point.y)
      pingT = 0
    }
    if (reduced) {
      // No rolling across the island: the ball is simply there
      pos.copy(point)
      vel.set(0, 0)
      target = null
    }
    dirty = true
    start()
  }

  function setInput(x, z) {
    input.set(x, z)
    if (x || z) {
      target = null
      goal = -1
    }
    start()
  }

  // The landmark under the mouse lifts a little, as a hint that it can be clicked
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

  // A click or tap at canvas coordinates. Returns the landmark's index, 'ground', or null for empty sky
  function pick(x, y, act = true) {
    ndc.set((x / size.w) * 2 - 1, -(y / size.h) * 2 + 1)
    raycaster.setFromCamera(ndc, camera)
    const [first] = raycaster.intersectObjects(pickables, false)
    if (first) {
      if (act) onPick?.(first.object.userData.project)
      return first.object.userData.project
    }
    if (!raycaster.ray.intersectPlane(ground, hit)) return null
    const d = Math.hypot(hit.x, hit.z)
    if (d > ISLAND - BALL - 0.1) return null
    if (act) {
      goal = -1
      sendTo(new Vector2(hit.x, hit.z))
    }
    return 'ground'
  }

  function collide() {
    for (const c of colliders) {
      const dx = pos.x - c.x
      const dy = pos.y - c.z
      const dist = Math.hypot(dx, dy)
      const min = c.r + BALL
      if (dist >= min || dist === 0) continue
      const nx = dx / dist
      const ny = dy / dist
      pos.set(c.x + nx * min, c.z + ny * min)
      const into = vel.x * nx + vel.y * ny
      if (into < 0) {
        vel.x -= 1.35 * into * nx
        vel.y -= 1.35 * into * ny
        // Trees shake when you bump into them
        if (c.wobble !== undefined) {
          c.wobbleV += Math.min(-into, 4) * 0.9
          c.axis.set(-ny, 0, nx)
        }
      }
    }
    // The edge of the island: a soft wall
    const d = pos.length()
    const edge = ISLAND - BALL - 0.12
    if (d > edge) {
      const nx = pos.x / d
      const ny = pos.y / d
      pos.set(nx * edge, ny * edge)
      const out = vel.x * nx + vel.y * ny
      if (out > 0) {
        vel.x -= 1.4 * out * nx
        vel.y -= 1.4 * out * ny
      }
    }
  }

  function step(dt) {
    const s = dt / 1000
    if (input.lengthSq() > 0) {
      vel.x += input.x * 24 * s
      vel.y += input.y * 24 * s
    } else if (target) {
      const dx = target.x - pos.x
      const dy = target.y - pos.y
      const dist = Math.hypot(dx, dy)
      const speed = Math.min(MAX_SPEED, dist * 3.2)
      const k = smooth(dt, 120)
      vel.x += ((dx / (dist || 1)) * speed - vel.x) * k
      vel.y += ((dy / (dist || 1)) * speed - vel.y) * k
      if (dist < 0.05) {
        target = null
        vel.multiplyScalar(0.3)
      }
    }
    vel.multiplyScalar(Math.exp(-s * (input.lengthSq() > 0 ? 1.6 : 2.6)))
    if (vel.length() > MAX_SPEED) vel.setLength(MAX_SPEED)
    if (vel.lengthSq() < 0.0004 && !target && input.lengthSq() === 0) vel.set(0, 0)

    const before = pos.clone()
    pos.addScaledVector(vel, s)
    collide()

    // Roll by the distance actually travelled
    const moved = pos.distanceTo(before)
    if (moved > 1e-5) {
      axis.set(pos.y - before.y, 0, -(pos.x - before.x)).normalize()
      q.setFromAxisAngle(axis, moved / BALL)
      body.quaternion.premultiply(q)
    }
    ball.position.set(pos.x, 0, pos.y)

    // Which landmark is the ball next to
    let next = -1
    landmarks.forEach((l, i) => {
      if (Math.hypot(l.x - pos.x, l.z - pos.y) < NEAR + 0.25) next = i
    })
    if (next !== near) {
      near = next
      onNear?.(near)
    }
    if (goal >= 0 && goal === near && !target) goal = -1
    return moved > 1e-5
  }

  const liftFor = (i) => (i === near ? 1 : i === hover ? 0.45 : 0)
  // The camera only leans in once the ball has come to rest at a landmark, not while it rolls past
  const arriveFor = () => (near >= 0 && !reduced && vel.length() < 0.5 && input.lengthSq() === 0 ? 1 : 0)

  function animate(dt) {
    clock += dt / 1000
    const t = reduced ? 0 : clock
    const k = smooth(dt, 140)
    let ringGlow = 0
    landmarks.forEach((l, i) => {
      l.lift += (liftFor(i) - l.lift) * k
      l.glow += (liftFor(i) - l.glow) * k
      ringGlow = Math.max(ringGlow, l.glow)
      const g = l.model.group
      g.position.y = PAD_TOP + l.lift * 0.08 + (reduced ? 0 : Math.sin(clock * 1.4 + i) * 0.015)
      g.scale.setScalar(MODEL_SCALE * (1 + l.lift * 0.06))
      l.model.update(t, l.lift)
      l.ring.visible = l.glow > 0.02
      l.ring.scale.setScalar(1 + (1 - l.glow) * 0.25)
    })
    glow.opacity = ringGlow * 0.9
    trees.forEach((tr) => {
      tr.wobbleV += -tr.wobble * 120 * (dt / 1000)
      tr.wobbleV *= Math.exp((-dt / 1000) * 5)
      tr.wobble += tr.wobbleV * (dt / 1000)
      tr.group.quaternion.setFromAxisAngle(tr.axis, tr.wobble * 0.25)
    })
    if (!reduced) {
      floaters.forEach((f) => (f.position.y += Math.sin(clock * 0.9 + f.userData.phase) * 0.0015))
      clouds.forEach((c) => {
        const { a, r, y, speed } = c.userData
        const angle = a + Math.sin(clock * speed + a) * 0.22
        c.position.set(Math.cos(angle) * r, y + Math.sin(clock * 0.3 + a) * 0.1, Math.sin(angle) * r)
        c.rotation.y = -angle
      })
      if (fireflies.visible) {
        const p = flyGeo.attributes.position
        for (let i = 0; i < flyCount; i++) {
          p.setXYZ(
            i,
            flyHome[i * 3] + Math.sin(clock * 0.7 + i) * 0.35,
            flyHome[i * 3 + 1] + Math.sin(clock * 1.3 + i * 2) * 0.18,
            flyHome[i * 3 + 2] + Math.cos(clock * 0.6 + i * 1.7) * 0.35,
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

    if (pingT < 1) {
      pingT = Math.min(1, pingT + dt / 650)
      ping.scale.setScalar(0.4 + pingT * 1.4)
      marker.opacity = (1 - pingT) * 0.7
    }

    // Camera: drifts a little after the ball, leans toward the pointer,
    // and eases in toward a landmark once the ball rests there
    pointer.x += (pointer.tx - pointer.x) * smooth(dt, 220)
    pointer.y += (pointer.ty - pointer.y) * smooth(dt, 220)
    arrive += (arriveFor() - arrive) * smooth(dt, 420)
    const l = landmarks[near]
    const dist = cameraDistance() * (1 - 0.14 * arrive)
    const follow = reduced ? 0 : 0.22
    lookAt.set(pos.x * follow, 0.2, pos.y * follow - 0.6)
    if (l) lookAt.lerp(tmp.set(l.x * 0.85, 0.5, l.z * 0.85 - 0.4), 0.45 * arrive)
    if (look.lengthSq() === 0 || reduced) look.copy(lookAt)
    else look.lerp(lookAt, smooth(dt, 260))
    tmp.set(look.x + pointer.x * 1.6, look.y + dist * 0.6 - pointer.y * 1.2, look.z + dist * 0.8)
    if (camPos.lengthSq() === 0 || reduced) camPos.copy(tmp)
    else camPos.lerp(tmp, smooth(dt, 260))
    camera.position.copy(camPos)
    camera.lookAt(look)
  }

  function render() {
    renderer.render(scene, camera)
    dirty = false
    if (onFrame) {
      const points = landmarks.map((l) => {
        tmp.set(l.x, l.labelY + l.lift * 0.12, l.z).project(camera)
        return { x: (tmp.x * 0.5 + 0.5) * size.w, y: (-tmp.y * 0.5 + 0.5) * size.h }
      })
      onFrame(points)
    }
  }

  function settled() {
    return (
      !target &&
      input.lengthSq() === 0 &&
      vel.lengthSq() === 0 &&
      pingT >= 1 &&
      Math.abs(pointer.tx - pointer.x) < 0.001 &&
      Math.abs(pointer.ty - pointer.y) < 0.001 &&
      landmarks.every((l, i) => Math.abs(l.lift - liftFor(i)) < 0.002) &&
      trees.every((tr) => Math.abs(tr.wobble) < 0.001 && Math.abs(tr.wobbleV) < 0.001)
    )
  }

  function loop(now) {
    raf = 0
    if (!running) return
    const dt = then ? Math.min(now - then, 50) : 16
    then = now
    const moved = step(dt)
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
    ;[glow, marker, flyMat].forEach((m) => m.dispose())
    stones.dispose()
    grass.dispose()
    renderer.dispose()
  }

  // First frame straight away, so the world never appears half-built
  ball.position.set(pos.x, 0, pos.y)
  animate(16)
  // ...and then a slow glide in from further out
  if (!reduced) camPos.multiplyScalar(1.6)

  return {
    resize,
    setFrame,
    setTheme,
    setInput,
    setPointer,
    setHover,
    goTo,
    pick,
    start,
    stop,
    dispose,
    render: () => {
      animate(16)
      render()
    },
    get near() {
      return near
    },
    get night() {
      return night
    },
  }
}
