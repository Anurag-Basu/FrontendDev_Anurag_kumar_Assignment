import type { TypedUseSelectorHook } from 'react-redux'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, WalletRootState } from './walletStore.ts'

export function useWalletDispatch(): AppDispatch {
  return useDispatch<AppDispatch>()
}

export const useWalletSelector: TypedUseSelectorHook<WalletRootState> = useSelector
