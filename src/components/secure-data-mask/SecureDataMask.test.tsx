import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import SecureDataMask, { REVEAL_TIMEOUT_MS } from './SecureDataMask.tsx'

describe('SecureDataMask', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('reveals then automasks after the timeout', () => {
    const sample = '1234 5678 9012'

    render(
      <SecureDataMask plaintext={sample} semanticLabel="Mock Aadhaar identifier" />,
    )

    expect(screen.getByText('XXXX XXXX 9012')).toBeInTheDocument()

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /tap to reveal/i }))
    })

    expect(screen.getByText(sample)).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(REVEAL_TIMEOUT_MS)
    })

    expect(screen.queryByText(sample)).not.toBeInTheDocument()

    expect(screen.getByText('XXXX XXXX 9012')).toBeInTheDocument()
  })
})
