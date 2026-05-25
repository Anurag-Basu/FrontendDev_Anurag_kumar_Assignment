// Async load for /api/credentials — wire-up only, no saga magic.
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  loadCredentialsPayload,
  type CredentialFetchMode,
} from '../api/credentialClient.ts'
import type { Credential } from '../types/credentialTypes.ts'
import {
  loadLastSuccessfulSnapshot,
  saveLastSuccessfulSnapshot,
} from './credentialLastSuccessStorage.ts'

export type CredentialLoadState = 'idle' | 'loading' | 'succeeded' | 'failed'

export type CredentialWalletState = Readonly<{
  items: Credential[]
  /** Last OK response that had at least one credential (also persisted locally). */
  lastSuccessfulItems: Credential[]
  lastSuccessfulFetchedAtISO: string | null
  status: CredentialLoadState
  error: string | null
  fetchedAtISO: string | null
}>

type WalletThunkState = Readonly<{ credentialWallet: CredentialWalletState }>

const bootSnap = loadLastSuccessfulSnapshot()

const initialState: CredentialWalletState = {
  items: [],
  lastSuccessfulItems: bootSnap?.items ?? [],
  lastSuccessfulFetchedAtISO: bootSnap?.fetchedAtISO ?? null,
  status: 'idle',
  error: null,
  fetchedAtISO: null,
}

export const fetchCredentialList = createAsyncThunk<
  Credential[],
  CredentialFetchMode | undefined,
  { state: WalletThunkState }
>('credentialWallet/load', (mode = 'default', { signal }) =>
  loadCredentialsPayload(mode, signal),
)

export const credentialWalletSlice = createSlice({
  name: 'credentialWallet',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCredentialList.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchCredentialList.fulfilled, (state, action) => {
        const at = new Date().toISOString()
        state.items = action.payload
        state.status = 'succeeded'
        state.fetchedAtISO = at
        state.error = null

        if (action.payload.length > 0) {
          state.lastSuccessfulItems = action.payload
          state.lastSuccessfulFetchedAtISO = at
          saveLastSuccessfulSnapshot({
            items: action.payload,
            fetchedAtISO: at,
          })
        }
      })
      .addCase(fetchCredentialList.rejected, (state, action) => {
        if (action.error.name === 'AbortError') {
          return
        }

        state.status = 'failed'
        state.error =
          action.error.message ?? 'Credential service did not cooperate.'
      })
  },
})
