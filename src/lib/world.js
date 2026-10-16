// The hero's little world: a floating island with one landmark per project and a ball you roll between them.
// Plain three.js with no React, loaded on its own after the page has painted (see HeroWorld.jsx).
import {
  BoxGeometry,
  CircleGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DirectionalLight,
  DodecahedronGeometry,
  Group,
  HemisphereLight,
  IcosahedronGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  OctahedronGeometry,
  PCFSoftShadowMap,
  PerspectiveCamera,
  Plane,
  Quaternion,
  Raycaster,
  Scene,
  TorusGeometry,
  TorusKnotGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three'

const ISLAND = 6.2 // radius of the island's flat top
const RING = 3.75 // how far from the middle the landmarks stand
const PAD = 0.85 // radius of a landmark's pedestal
const BALL = 0.42 // radius of the ball
const NEAR = PAD + BALL + 0.75 // close enough to "arrive" at a landmark
const MAX_SPEED = 5.2
const FOV = 30

// Small seeded random, so the trees grow in the same places on every visit
function seeded(seed) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
}

const smooth = (dt, ms) => 1 - Math.exp(-dt / ms)

// Each project gets its own landmark shape, in data order
const SHAPES = [
  () => new BoxGeometry(0.62, 1.25, 0.62),
  () => new IcosahedronGeometry(0.58, 0),
  () => new TorusKnotGeometry(0.34, 0.12, 64, 8),
  () => new OctahedronGeometry(0.62, 0),
  () => new DodecahedronGeometry(0.55, 0),
  () => new ConeGeometry(0.55, 1.2, 6),
]

export function createWorld(canvas, { count, tones, reduced = false, onFrame, onNear, onPick }) {
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

  const flat = () => new MeshStandardMaterial({ roughness: 0.92, metalness: 0, flatShading: true })
  const mats = { top: flat(), side: flat(), rock: flat(), pad: flat(), tree: flat(), trunk: flat(), ball: flat(), band: flat() }
  const glow = new MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
  const marker = new MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
  const toneMats = tones.map(() => flat())

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

  // Landmarks, evenly around the ring, the first one at the front
  const pickables = []
  const colliders = []
  const landmarks = Array.from({ length: count }, (_, i) => {
    const a = Math.PI / 2 - (i / count) * Math.PI * 2
    const x = Math.cos(a) * RING
    const z = Math.sin(a) * RING
    const group = new Group()
    group.position.set(x, 0, z)

    const pad = new Mesh(new CylinderGeometry(PAD, PAD + 0.08, 0.24, 24), mats.pad)
    pad.position.y = 0.12
    pad.castShadow = pad.receiveShadow = true
    const shape = new Mesh(SHAPES[i % SHAPES.length](), toneMats[i])
    shape.castShadow = true
    const base = 0.24 + 0.85
    shape.position.y = base
    const ring = new Mesh(new TorusGeometry(PAD + 0.28, 0.035, 6, 48), glow)
    ring.rotation.x = Math.PI / 2
    ring.position.y = 0.02
    group.add(pad, shape, ring)
    scene.add(group)

    pad.userData.project = shape.userData.project = i
    pickables.push(pad, shape)
    colliders.push({ x, z, r: PAD + 0.04 })
    return { group, shape, ring, base, x, z, a, lift: 0, glow: 0 }
  })

  // Trees and rocks, kept clear of the landmarks and of the middle where the ball starts
  const trees = []
  for (let tries = 0; trees.length < 15 && tries < 400; tries++) {
    const a = random() * Math.PI * 2
    const d = 1.6 + random() * (ISLAND - 2.2)
    const x = Math.cos(a) * d
    const z = Math.sin(a) * d
    const clear =
      landmarks.every((l) => Math.hypot(l.x - x, l.z - z) > PAD + 1.5) &&
      trees.every((t) => Math.hypot(t.x - x, t.z - z) > 1) &&
      // Leave a path from the middle to each landmark
      landmarks.every((l) => {
        const len = Math.hypot(l.x, l.z)
        const along = (x * l.x + z * l.z) / len
        const off = Math.abs(x * l.z - z * l.x) / len
        return along < 0 || along > len || off > 0.95
      })
    if (!clear) continue
    const scale = 0.7 + random() * 0.6
    const group = new Group()
    group.position.set(x, 0, z)
    if (random() < 0.75) {
      const crown = new Mesh(new ConeGeometry(0.38, 1, 6), mats.tree)
      crown.position.y = 0.85
      const trunk = new Mesh(new CylinderGeometry(0.07, 0.09, 0.4, 5), mats.trunk)
      trunk.position.y = 0.2
      crown.castShadow = trunk.castShadow = true
      group.add(crown, trunk)
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
  ping.position.y = 0.015
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
  let frame = { focusX: 0.5, width: 1 }
  let size = { w: 1, h: 1 }
  let pointer = { x: 0, y: 0, tx: 0, ty: 0 }
  const look = new Vector3()
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

  function setTheme(c, dark) {
    const col = (v) => new Color(v)
    mats.top.color.copy(col(c.surface).lerp(col(c.line), dark ? 0.15 : 0.45))
    mats.side.color.copy(col(c.line).lerp(col(c.fg), dark ? 0.06 : 0.14))
    mats.rock.color.copy(col(c.line).lerp(col(c.fg), dark ? 0.12 : 0.22))
    mats.pad.color.copy(col(c.surface).lerp(col(c.fg), dark ? 0.08 : 0.05))
    mats.tree.color.copy(col(c.muted).lerp(col(c.line), dark ? 0.35 : 0.25))
    mats.trunk.color.copy(col(c.muted).lerp(col(c.fg), 0.3))
    mats.ball.color.copy(col(c.accent))
    mats.band.color.copy(col(c.fg).lerp(col(c.accent), 0.2))
    glow.color.copy(col(c.accent))
    marker.color.copy(col(c.accent))
    toneMats.forEach((m, i) => m.color.copy(dark ? col(tones[i]).lerp(col(c.accent), 0.12).multiplyScalar(0.82) : col(tones[i]).lerp(col(c.fg), 0.06)))
    hemi.color.set(dark ? 0xd8d2c8 : 0xffffff)
    hemi.groundColor.set(dark ? 0x2a2622 : 0x8a8478)
    hemi.intensity = dark ? 1.15 : 1.6
    sun.intensity = dark ? 1.7 : 2.1
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
      ping.position.set(point.x, 0.015, point.y)
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

  function animate(dt) {
    clock += dt / 1000
    const k = smooth(dt, 140)
    landmarks.forEach((l, i) => {
      const on = i === near ? 1 : i === hover ? 0.45 : 0
      l.lift += (on - l.lift) * k
      l.glow += (on - l.glow) * k
      l.shape.position.y = l.base + l.lift * 0.35 + (reduced ? 0 : Math.sin(clock * 1.4 + i) * 0.06)
      if (!reduced) l.shape.rotation.y += dt * 0.0004 * (1 + l.lift * 2.5)
      l.ring.material.opacity = Math.max(...landmarks.map((m) => m.glow)) * 0.9
      l.ring.visible = l.glow > 0.02
      l.ring.scale.setScalar(1 + (1 - l.glow) * 0.25)
    })
    trees.forEach((t) => {
      t.wobbleV += -t.wobble * 120 * (dt / 1000)
      t.wobbleV *= Math.exp((-dt / 1000) * 5)
      t.wobble += t.wobbleV * (dt / 1000)
      t.group.quaternion.setFromAxisAngle(t.axis, t.wobble * 0.25)
    })
    if (!reduced) floaters.forEach((f) => (f.position.y += Math.sin(clock * 0.9 + f.userData.phase) * 0.0015))

    if (pingT < 1) {
      pingT = Math.min(1, pingT + dt / 650)
      ping.scale.setScalar(0.4 + pingT * 1.4)
      marker.opacity = (1 - pingT) * 0.7
    }

    // Camera: drifts a little after the ball and leans toward the pointer
    pointer.x += (pointer.tx - pointer.x) * smooth(dt, 220)
    pointer.y += (pointer.ty - pointer.y) * smooth(dt, 220)
    const dist = cameraDistance()
    const follow = reduced ? 0 : 0.22
    look.set(pos.x * follow, 0.2, pos.y * follow - 0.6)
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
        tmp.set(l.x, l.base + 1.15 + l.lift * 0.35, l.z).project(camera)
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
      landmarks.every((l, i) => Math.abs(l.lift - (i === near ? 1 : i === hover ? 0.45 : 0)) < 0.002) &&
      trees.every((t) => Math.abs(t.wobble) < 0.001 && Math.abs(t.wobbleV) < 0.001)
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
    toneMats.forEach((m) => m.dispose())
    glow.dispose()
    marker.dispose()
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
  }
}
