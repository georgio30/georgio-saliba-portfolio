// Small motion helpers shared across the site

export const pad = (n) => String(n).padStart(2, '0')
export const clamp = (v, min, max) => Math.min(max, Math.max(min, v))

// Frame-rate independent easing toward a target: the share of the gap to close this frame
export const ease = (dt, ms) => 1 - Math.exp(-dt / ms)
