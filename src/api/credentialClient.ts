import type { Credential } from '../types/credentialTypes.ts'

export type CredentialsPayload = Readonly<{ credentials: Credential[] }>

export type CredentialFetchMode = 'default' | 'empty' | 'unavailable'

function normalizeBase(raw: unknown): string {
  const base = typeof raw === 'string' ? raw.trim() || '/' : '/'
  return base.endsWith('/') ? base : `${base}/`
}

export function buildCredentialsRequest(mode: CredentialFetchMode): Request {
  const search =
    mode === 'empty' ? '?empty=1' : mode === 'unavailable' ? '?fail=1' : ''

  return new Request(
    `${normalizeBase(import.meta.env.BASE_URL)}api/credentials${search}`,
    {
      method: 'GET',
      credentials: 'same-origin',
      headers: { Accept: 'application/json' },
    },
  )
}

export async function loadCredentialsPayload(
  mode: CredentialFetchMode,
  signal?: AbortSignal,
): Promise<Credential[]> {
  const request = buildCredentialsRequest(mode)
  const merged = signal
    ? new Request(request, { signal })
    : request

  const res = await fetch(merged)

  if (!res.ok) {
    throw new Error(
      res.status >= 500
        ? 'Upstream mock service failed.'
        : `Request stalled (${res.status}).`,
    )
  }

  const body = (await res.json()) as CredentialsPayload
  const list = body.credentials ?? []

  return [...list]
}
