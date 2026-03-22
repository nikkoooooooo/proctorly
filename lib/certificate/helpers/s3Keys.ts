export function getCertificateKey(studentId: string, quizId: string, attemptId: string) {
  return `certs/${studentId}/${quizId}/${attemptId}.pdf`
}
