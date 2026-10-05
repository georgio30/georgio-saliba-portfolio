// The slides a project's gallery shows: its screenshots, or generated panels when it has none
export function gallerySlides(project) {
  if (project.screenshots.length) return project.screenshots.map((shot) => ({ kind: 'shot', shot }))
  const slides = [{ kind: 'cover' }]
  if (project.layers) slides.push({ kind: 'layers' })
  return slides
}
