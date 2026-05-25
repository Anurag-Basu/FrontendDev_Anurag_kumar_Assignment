import { useEffect, useMemo, useState } from 'react'
import type { CredentialFetchMode } from '../../api/credentialClient.ts'
import type { Credential } from '../../types/credentialTypes.ts'
import { fetchCredentialList } from '../../store/credentialWalletSlice.ts'
import { useWalletDispatch, useWalletSelector } from '../../store/hooks.ts'
import { CredentialCard } from './CredentialCard.tsx'
import styles from './dashboard.module.css'

function formatFetchedAt(iso: string | null): string | undefined {
  if (!iso) return undefined
  try {
    return Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(new Date(iso))
  } catch {
    return undefined
  }
}

function staleNoticeCopy(
  online: boolean,
  kind: 'fetch-failed' | 'empty-response',
  savedAtLabel: string | undefined,
): string {
  const when = savedAtLabel ? ` Saved ${savedAtLabel}.` : ''
  if (kind === 'empty-response') {
    return `The latest response was empty.${when} Showing your last synced credentials from local storage — not fresh from the network.`
  }
  if (!online) {
    return `You're offline.${when} Showing your last synced credentials from local storage until the connection returns.`
  }
  return `We couldn't refresh from the server.${when} Showing your last synced credentials from local storage until a new request succeeds.`
}

export default function CredentialDashboard() {
  const dispatch = useWalletDispatch()
  const rows = useWalletSelector((s) => s.credentialWallet.items)
  const lastOkRows = useWalletSelector((s) => s.credentialWallet.lastSuccessfulItems)
  const lastOkAt = useWalletSelector((s) => s.credentialWallet.lastSuccessfulFetchedAtISO)
  const status = useWalletSelector((s) => s.credentialWallet.status)
  const faultCopy = useWalletSelector((s) => s.credentialWallet.error)
  const syncedAt = useWalletSelector((s) => s.credentialWallet.fetchedAtISO)

  const [online, setOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  )

  useEffect(() => {
    const onUp = (): void => {
      setOnline(true)
    }
    const onDown = (): void => {
      setOnline(false)
    }
    window.addEventListener('online', onUp)
    window.addEventListener('offline', onDown)
    return () => {
      window.removeEventListener('online', onUp)
      window.removeEventListener('offline', onDown)
    }
  }, [])

  useEffect(() => {
    void dispatch(fetchCredentialList())
  }, [dispatch])

  const replay = (mode: CredentialFetchMode): void => {
    void dispatch(fetchCredentialList(mode))
  }

  const waiting = status === 'idle' || status === 'loading'

  const layout = useMemo(() => {
    const hasStored = lastOkRows.length > 0
    const liveHasRows = status === 'succeeded' && rows.length > 0

    if (liveHasRows) {
      const pretty = formatFetchedAt(syncedAt)
      return {
        variant: 'live' as const,
        credentials: rows,
        prettySynced: pretty,
      }
    }

    if (
      status === 'failed' &&
      hasStored
    ) {
      return {
        variant: 'stale' as const,
        staleReason: 'fetch-failed' as const,
        credentials: lastOkRows,
      }
    }

    if (status === 'succeeded' && rows.length === 0 && hasStored) {
      return {
        variant: 'stale' as const,
        staleReason: 'empty-response' as const,
        credentials: lastOkRows,
      }
    }

    return { variant: 'none' as const }
  }, [lastOkRows, rows, status, syncedAt])

  if (waiting) {
    return (
      <section className={styles.dashboard} aria-live="polite">
        <div className={styles.headlineWrap}>
          <h2 className={styles.heroTitle}>Loading…</h2>

          <p className={styles.lede}>
            Waiting on <code>/api/credentials</code>. Nothing fancy here yet.
          </p>
        </div>

        <div className={styles.statePanel} role="status">
          <div className={styles.stateBusy}>
            <div className={styles.shimmerStrip} />
            <div className={styles.shimmerStrip} />
            <div className={styles.shimmerStrip} />
          </div>
        </div>
      </section>
    )
  }

  if (status === 'failed' && layout.variant !== 'stale') {
    return (
      <section className={styles.dashboard}>
        <div className={styles.headlineWrap}>
          <h2 className={styles.heroTitle}>Couldn’t load credentials</h2>

          <p className={styles.lede}>
            Fetch failed — check the mock server or flip back to Wi‑Fi. If SW already cached a 200,
            toggling offline and refreshing can still work in a full build.
          </p>
        </div>

        <div className={styles.statePanel} role="alert">
          <p>{faultCopy ?? 'No error message from the client.'}</p>

          <div className={styles.ctaRows}>
            <button
              type="button"
              className={styles.buttonPrimary}
              onClick={() => replay('default')}
            >
              Retry
            </button>
          </div>

          <DevMockPanel reload={replay} />
        </div>
      </section>
    )
  }

  if (layout.variant === 'none' && status === 'succeeded' && rows.length === 0) {
    return (
      <section className={styles.dashboard}>
        <div className={styles.headlineWrap}>
          <h2 className={styles.heroTitle}>No rows</h2>

          <p className={styles.lede}>API came back 200 but the list is empty.</p>
        </div>

        <div className={styles.statePanel}>
          <button
            type="button"
            className={styles.buttonPrimary}
            onClick={() => replay('default')}
          >
            Load mock list
          </button>

          <DevMockPanel reload={replay} />
        </div>
      </section>
    )
  }

  /* Exhaustive guards above should leave only live vs stale snapshots. */
  if (layout.variant !== 'live' && layout.variant !== 'stale') {
    return null
  }

  const staleReason =
    layout.variant === 'stale' ? layout.staleReason : undefined

  const staleAtLabel = staleReason ? formatFetchedAt(lastOkAt) : undefined

  const notice =
    staleReason !== undefined
      ? staleNoticeCopy(online, staleReason, staleAtLabel)
      : undefined

  const headline =
    staleReason === 'fetch-failed' ? 'Wallet (offline snapshot)' : 'Wallet'

  const ledeSynced =
    layout.variant === 'live' &&
    layout.prettySynced ? `Fetched ${layout.prettySynced}.` : ''

  return (
    <section className={styles.dashboard}>
      <header className={styles.headlineWrap}>
        <h2 className={styles.heroTitle}>{headline}</h2>

        <p className={styles.lede}>
          Fake credentials for the assignment. Tap reveal on a field if you need to test the mask
          timer.
          {layout.variant === 'live' ? ` ${ledeSynced}` : ''}
        </p>

        {notice ? (
          <p className={styles.cacheNotice} role="status">
            {notice}
          </p>
        ) : null}

        {staleReason === 'fetch-failed' ? (
          <div className={`${styles.ctaRows} ${styles.ctaRowsStart}`}>
            <button type="button" className={styles.buttonPrimary} onClick={() => replay('default')}>
              Retry
            </button>
            <p className={styles.fetchErrorAside}>
              {faultCopy ?? 'Request did not succeed.'}
            </p>
          </div>
        ) : null}
      </header>

      <CredentialGrid list={layout.credentials} />

      <DevMockPanel reload={replay} />
    </section>
  )
}

function CredentialGrid({ list }: Readonly<{ list: readonly Credential[] }>) {
  return (
    <ul className={styles.grid} aria-label="Credentials">
      {list.map((row) => (
        <li key={row.id}>
          <CredentialCard item={row} />
        </li>
      ))}
    </ul>
  )
}

function DevMockPanel({
  reload,
}: Readonly<{ reload: (mode: CredentialFetchMode) => void }>) {
  if (!import.meta.env.DEV) {
    return null
  }

  return (
    <details style={{ justifySelf: 'start' }}>
      <summary>Dev: mock API</summary>

      <div className={styles.ctaRows}>
        <button type="button" className={styles.buttonNeutral} onClick={() => reload('default')}>
          OK response
        </button>

        <button type="button" className={styles.buttonNeutral} onClick={() => reload('empty')}>
          Empty list
        </button>

        <button
          type="button"
          className={styles.buttonNeutral}
          onClick={() => reload('unavailable')}
        >
          503 / fail
        </button>
      </div>
    </details>
  )
}
