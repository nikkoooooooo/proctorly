export function getCertificateKey(studentId: string, quizId: string, attemptId: string) {
  return `certs/${studentId}/${quizId}/${attemptId}.pdf`
}

export function getCertificateLogoKey(quizId: string) {
  return `cert-logos/${quizId}/logo.png`
}

export function getCertificateSignatureKey(quizId: string) {
  return `cert-signatures/${quizId}/signature.png`
}
