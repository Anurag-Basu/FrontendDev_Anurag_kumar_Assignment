/** json shape returned by the mock verifier */

export type CredentialStatus = 'active' | 'expired'

export type Credential = Readonly<{
  id: string
  kind: string
  title: string
  holderName: string
  identifierValue: string
  issuer: string
  issuedOn: string
  status: CredentialStatus
}>
