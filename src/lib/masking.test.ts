import { describe, expect, it } from 'vitest'
import { maskIdentifier } from './masking.ts'

describe('maskIdentifier', () => {
  it('keeps the last four identifier characters visible', () => {
    expect(maskIdentifier('1234 5678 9012')).toBe('XXXX XXXX 9012')
  })

  it('handles mixed alphanumeric references', () => {
    expect(maskIdentifier('ABCDE1234F')).toBe('XXXXXX234F')
  })
})
