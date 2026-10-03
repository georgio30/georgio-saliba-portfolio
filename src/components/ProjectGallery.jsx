import { useRef, useState } from 'react'
import Screenshot from './Screenshot'
import { ProjectCover, ProjectLayers } from './ProjectCover'
import { gallerySlides } from '../lib/gallery'

export default function ProjectGallery({ project, number, index, onChange }) {
  const slides = gallerySlides(project)
  const many = slides.length > 1
  const [drag, setDrag] = useState(0)
  const start = useRef(null)
  const go = (i) => onChange((i + slides.length) % slides.length)

  // Swipe: follow the finger, then settle on the nearest slide
  const onPointerDown = (e) => {
    if (!many || e.pointerType === 'mouse') return
    e.currentTarget.setPointerCapture(e.pointerId)
    start.current = { x: e.clientX, y: e.clientY, horizontal: null }
  }
  const onPointerMove = (e) => {
    const s = start.current
    if (!s) return
    const dx = e.clientX - s.x
    if (s.horizontal === null && Math.hypot(dx, e.clientY - s.y) > 8) {
      s.horizontal = Math.abs(dx) > Math.abs(e.clientY - s.y)
    }
    if (s.horizontal) setDrag(dx)
  }
  const onPointerEnd = () => {
    if (!start.current) return
    if (Math.abs(drag) > 50) go(index + (drag < 0 ? 1 : -1))
    start.current = null
    setDrag(0)
  }

  return (
    <div>
      <div
        className="relative aspect-[16/10] touch-pan-y overflow-hidden rounded-[6px] border border-line bg-surface select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        aria-roledescription="carousel"
        aria-label={`${project.title} images`}
      >
        <div
          className={`flex h-full ${drag ? '' : 'transition-transform duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)]'}`}
          style={{ transform: `translateX(calc(${-index * 100}% + ${drag}px))` }}
        >
          {slides.map((slide, i) => (
            <div
              key={i}
              className="h-full w-full shrink-0"
              aria-hidden={i !== index}
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${slides.length}`}
            >
              {slide.kind === 'shot' && (
                <Screenshot shot={slide.shot} eager={Math.abs(i - index) <= 1} sizes="(min-width: 1100px) 1040px, 94vw" />
              )}
              {slide.kind === 'cover' && <ProjectCover project={project} number={number} />}
              {slide.kind === 'layers' && <ProjectLayers project={project} />}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <p className="min-w-0 truncate text-sm text-muted" aria-live="polite">
          {slides[index].caption}
        </p>

        {many && (
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Previous image"
              className="flex size-9 items-center justify-center rounded-full text-fg transition-colors hover:bg-fg/5"
            >
              ←
            </button>
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => go(i)}
                aria-label={`Show image ${i + 1} of ${slides.length}`}
                aria-current={i === index ? 'true' : undefined}
                className="group flex size-6 items-center justify-center"
              >
                <span
                  className={`block size-1.5 rounded-full transition-all duration-300 ${
                    i === index ? 'w-4 bg-accent' : 'bg-muted/40 group-hover:bg-muted'
                  }`}
                />
              </button>
            ))}
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Next image"
              className="flex size-9 items-center justify-center rounded-full text-fg transition-colors hover:bg-fg/5"
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
