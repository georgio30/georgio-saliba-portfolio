// Splits text into words that rise out of a mask one after another (styles: .rise in index.css).
// `start` continues the stagger from an earlier piece of the same line.
export default function Words({ text, start = 0 }) {
  let i = start
  return text.split(/(\s+)/).map((part, k) =>
    !part || /^\s+$/.test(part) ? (
      part
    ) : (
      <span key={k} className="w">
        <span style={{ '--i': i++ }}>{part}</span>
      </span>
    ),
  )
}