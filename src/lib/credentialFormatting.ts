import type { Credential } from '../types/credentialTypes.ts'

export function formatHumanIdentifier(credential: Credential): string {
  const trimmed = credential.identifierValue.trim()

  const digitsOnly = trimmed.replace(/\D/g, '')

  if (credential.kind.toLowerCase() === 'aadhaar' && digitsOnly.length === 12) {
    return digitsOnly.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
  }

  return trimmed.replace(/\s+/g, ' ')
}
