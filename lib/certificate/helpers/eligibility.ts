interface EligibilityInput {
  score: number | null
  totalPoints: number | null
  passingPercentage: number | null
  tabSwitchCount: number | null
  certificateEnabled: boolean
}

export function getCertificateEligibility(input: EligibilityInput) {
  if (!input.certificateEnabled) {
    return { eligible: false, reason: "Certificates are disabled for this quiz." }
  }

  const tabSwitches = input.tabSwitchCount ?? 0
  if (tabSwitches >= 5) {
    return { eligible: false, reason: "Too many tab switches." }
  }

  if (input.passingPercentage !== null && input.passingPercentage !== undefined) {
    const score = input.score ?? 0
    const total = input.totalPoints ?? 0
    const percentage = total > 0 ? (score / total) * 100 : 0
    if (percentage < input.passingPercentage) {
      return { eligible: false, reason: "Passing percentage not met." }
    }
  }

  return { eligible: true, reason: null }
}
