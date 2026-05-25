import { memo, useMemo } from 'react'
import type { Credential } from '../../types/credentialTypes.ts'
import { formatHumanIdentifier } from '../../lib/credentialFormatting.ts'
import SecureDataMask from '../secure-data-mask/SecureDataMask.tsx'
import styles from './card.module.css'

type CredentialCardProps = Readonly<{ item: Credential }>

function CredentialCardInner({ item }: CredentialCardProps) {
  const label = `${item.kind} issuer reference`

  const issuance = useMemo(
    () =>
      Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
      }).format(new Date(item.issuedOn)),
    [item.issuedOn],
  )

  return (
    <article className={styles.card} aria-labelledby={`${item.id}-title`}>
      <div className={styles.cardHeaderRow}>
        <span className={styles.category}>{item.kind}</span>
        <span
          aria-label={`credential status ${item.status}`}
          className={`${styles.statusPill} ${
            item.status === 'active' ? styles.statusActive : styles.statusExpired
          }`}
        >
          {item.status}
        </span>
      </div>

      <div className={styles.holderMeta}>
        <strong id={`${item.id}-title`}>{item.title}</strong>

        <p className={styles.calendarLine}>{`Issued ${issuance}`}</p>

        <p className={styles.calendarLine}>{`Holder • ${item.holderName}`}</p>

        <p className={styles.calendarLine}>{`Issuer • ${item.issuer}`}</p>

        <p className={styles.labelLine}>Identifier</p>
        <SecureDataMask
          key={`${item.id}:${item.identifierValue}`}
          semanticLabel={`${label} for ${item.holderName}`}
          plaintext={formatHumanIdentifier(item)}
        />
      </div>
    </article>
  )
}

export const CredentialCard = memo(CredentialCardInner)
