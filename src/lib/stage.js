// The 3D gallery's maths, shared by the scroll gallery and the "scrub it yourself" demo

export const pad = (n) => String(n).padStart(2, '0')
export const clamp = (v, min, max) => Math.min(max, Math.max(min, v))

// Where a card sits in the scene, from its distance to the front of the stage.
// d > 0: still ahead, waiting further back and a little higher.
// d < 0: already passed, drifting back and off to one side.
// `unit` is what the sideways drift is measured in (vw on the page, % in the demo).
export function place(d, side, compact, unit = 'vw') {
  const k = compact ? 0.5 : 1
  if (d >= 0) {
    const z = -d * 620 * k
    return {
      z,
      transform: `translate3d(0, ${-d * 130 * k}px, ${z}px) rotateX(${compact ? 0 : d * 3}deg)`,
      opacity: d < 1.2 ? 1 : clamp(1 - (d - 1.2) * 0.8, 0, 1),
      // Cards waiting further back sit in a little shade, like distance in a room
      shade: clamp(d * 0.32, 0, 0.55),
    }
  }
  const a = -d
  // Sinks back fast, so it drops behind the card that is taking its place
  const z = -a * 1100 * k
  return {
    z,
    transform: `translate3d(${side * a * (compact ? 30 : 40)}${unit}, ${a * 30}px, ${z}px) rotateY(${-side * a * (compact ? 6 : 16)}deg)`,
    opacity: clamp(1 - (a - 0.4) * 1.8, 0, 1),
    shade: clamp(a * 0.5, 0, 0.55),
  }
}

// Frame-rate independent easing toward a target: the share of the gap to close this frame
export const ease = (dt, ms) => 1 - Math.exp(-dt / ms)
