// What the hero's island shares with the rest of the page

// Checked up front so the hero can lay itself out for the world, or without it, before first paint
export function hasWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

// ProjectShowcase listens for this and opens the case study. `from`: 'island' (the archipelago) or 'hero' (the cards shown instead of it)
export const openProject = (slug, from = 'island') => window.dispatchEvent(new CustomEvent('open-project', { detail: { slug, from } }))
