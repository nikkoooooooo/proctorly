export function buildSerialNumber(issuedAt: Date, seed: string) {
  const year = issuedAt.getFullYear()
  const tail = seed.replace(/[^A-Za-z0-9]/g, "").slice(-5).toUpperCase().padStart(5, "0")
  return `CERT-${year}-${tail}`
}
