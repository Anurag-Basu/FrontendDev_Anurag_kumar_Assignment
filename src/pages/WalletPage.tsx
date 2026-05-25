import CredentialDashboard from '../components/credential-dashboard/CredentialDashboard.tsx'

export default function WalletPage() {
  return (
    <div className="surface">
      <a className="skipLink" href="#wallet-main">
        Skip to wallet content
      </a>

      <header className="marketingHeader">
        <div>
          <p className="eyebrow">UIDAI sandbox take-home</p>
          <h1>Mock credential wallet</h1>
        </div>

        <p className="lede muted">
          All data is fake. Offline only really shows up after you ship a build and{' '}
          <code className="inlineCode">GET /api/credentials</code> succeeds once online (so SW can cache
          it).
        </p>
      </header>

      <main id="wallet-main">
        <CredentialDashboard />
      </main>

      <footer className="footerNote">
        <p>
          SW bundle only after <code className="inlineCode">npm run build</code>. Easiest demo:
          then <code className="inlineCode">npm run preview:offline</code> (serves{' '}
          <code className="inlineCode">dist/</code> + the mock API).
        </p>
      </footer>
    </div>
  )
}
