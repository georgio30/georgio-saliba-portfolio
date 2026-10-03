const srcSet = (name) => `/images/projects/${name}-800.webp 800w, /images/projects/${name}-1600.webp 1600w`

// A project screenshot made by `npm run images` (see src/data/projects.js).
// `phone` swaps in a different screenshot on small screens.
export default function Screenshot({ shot, phone, sizes, eager = false, className = '' }) {
  return (
    <picture className="block size-full">
      {phone && <source media="(max-width: 767px)" srcSet={srcSet(phone.name)} sizes="90vw" />}
      <img
        src={`/images/projects/${shot.name}-800.webp`}
        srcSet={srcSet(shot.name)}
        sizes={sizes}
        alt={shot.alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        draggable="false"
        className={`size-full object-cover object-top ${className}`}
      />
    </picture>
  )
}
