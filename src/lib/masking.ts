/** Mask everything except trailing four identifier characters while keeping separators. */

export function maskIdentifier(raw: string): string {
  const slots = [...raw].map((ch, idx) => ({ ch, idx })).filter(({ ch }) =>
    /[0-9A-Za-z]/.test(ch),
  )

  if (slots.length === 0) return raw

  if (slots.length <= 4) {
    return raw.replace(/[0-9A-Za-z]/g, () => 'X')
  }

  const keepIndices = new Set(slots.slice(-4).map(({ idx }) => idx))

  return [...raw]
    .map((glyph, idx) => {
      if (!/[0-9A-Za-z]/.test(glyph)) return glyph
      return keepIndices.has(idx) ? glyph : 'X'
    })
    .join('')
}
