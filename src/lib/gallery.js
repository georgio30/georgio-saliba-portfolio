// The slides a project's gallery shows: its screenshots, or generated panels when it has none
export function gallerySlides(project) {
  if (project.screenshots.length) return project.screenshots.map((shot) => ({ kind: 'shot', shot, caption: shot.alt }))
  const slides = [{ kind: 'cover', caption: 'Cover · screenshots coming soon' }]
  if (project.layers) slides.push({ kind: 'layers', caption: "How it's put together" })
  return slides
}
