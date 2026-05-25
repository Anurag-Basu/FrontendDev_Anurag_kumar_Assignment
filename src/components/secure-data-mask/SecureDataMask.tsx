import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { maskIdentifier } from '../../lib/masking.ts'
import styles from './secureDataMask.module.css'

export const REVEAL_TIMEOUT_MS = 10_000

type SecureDataMaskProps = Readonly<{
  semanticLabel: string
  plaintext: string
}>

export default function SecureDataMask({ plaintext, semanticLabel }: SecureDataMaskProps) {
  const [revealed, setRevealed] = useState(false)
  const [srNote, setSrNote] = useState('')
  const timerRef = useRef<number | undefined>(undefined)
  const previewId = useId()

  const scrambled = plaintext ? maskIdentifier(plaintext) : ''

  const shown = plaintext ? (revealed ? plaintext : scrambled || 'XXXX') : '—'

  const hide = useCallback((note: string) => {
    window.clearTimeout(timerRef.current)
    timerRef.current = undefined
    setRevealed(false)
    setSrNote(note)
  }, [])

  const handleTap = () => {
    window.clearTimeout(timerRef.current)

    if (revealed) {
      hide('Masked again.')
      return
    }

    if (!plaintext) {
      return
    }

    setRevealed(true)
    setSrNote('Showing full value.')

    timerRef.current = window.setTimeout(() => {
      hide('Timed out — masked.')
    }, REVEAL_TIMEOUT_MS)
  }

  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  return (
    <div className={styles.wrap} aria-label={`${semanticLabel}`}>
      <p className={styles.preview} translate="no" id={previewId}>
        {shown}
      </p>

      <div className={styles.toolbar}>
        <button
          type="button"
          className={styles.revealToggle}
          onClick={handleTap}
          aria-expanded={revealed}
          aria-controls={previewId}
          disabled={!plaintext}
        >
          {revealed ? 'Hide' : 'Tap to reveal'}
        </button>

        {plaintext ? (
          <p
            className={`${styles.keyboardHint} ${revealed ? styles.keyboardHintConcealed : ''}`}
            aria-hidden="true"
          >
            Space / Enter works when focused.
          </p>
        ) : null}
      </div>

      <span className={styles.visuallyHidden} aria-live="polite" aria-atomic="true">
        {srNote}
      </span>
    </div>
  )
}
