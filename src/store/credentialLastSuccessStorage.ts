import type { Credential } from '../types/credentialTypes.ts'

const STORAGE_KEY = 'credentialWallet.lastSuccess.v1'
const STORAGE_VERSION = 1 as const

type StoredPayload = Readonly<{
  v: typeof STORAGE_VERSION
  items: Credential[]
  fetchedAtISO: string
}>

export type LastSuccessSnapshot = Readonly<{
  items: Credential[]
  fetchedAtISO: string
}>

function isCredentialList(value: unknown): value is Credential[] {
  if (!Array.isArray(value)) return false
  return value.every(
    (entry) =>
      entry &&
      typeof entry === 'object' &&
      typeof (entry as Credential).id === 'string',
  )
}

export function loadLastSuccessfulSnapshot(): LastSuccessSnapshot | null {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    const payload = parsed as Partial<StoredPayload>
    if (payload.v !== STORAGE_VERSION) return null
    if (typeof payload.fetchedAtISO !== 'string') return null
    if (!isCredentialList(payload.items)) return null
    return { items: [...payload.items], fetchedAtISO: payload.fetchedAtISO }
  } catch {
    return null
  }
}

export function saveLastSuccessfulSnapshot(snapshot: LastSuccessSnapshot): void {
  if (typeof localStorage === 'undefined') return
  try {
    const payload: StoredPayload = {
      v: STORAGE_VERSION,
      items: [...snapshot.items],
      fetchedAtISO: snapshot.fetchedAtISO,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // Private mode / quota — ignore persistence.
  }
}
