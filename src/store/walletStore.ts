import { configureStore } from '@reduxjs/toolkit'
import { credentialWalletSlice } from './credentialWalletSlice.ts'

export const walletStore = configureStore({
  reducer: {
    credentialWallet: credentialWalletSlice.reducer,
  },
})

export type WalletRootState = ReturnType<typeof walletStore.getState>
export type AppDispatch = typeof walletStore.dispatch
