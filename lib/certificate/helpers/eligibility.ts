interface EligibilityInput {
  score: number | null
  passingScore: number | null
  tabSwitchCount: number | null
  certificateEnabled: boolean
}

export function getCertificateEligibility(input: EligibilityInput) {
  if (!input.certificateEnabled) {
    return { eligible: false, reason: "Certificates are disabled for this quiz." }
  }

  const tabSwitches = input.tabSwitchCount ?? 0
  if (tabSwitches >= 2) {
    return { eligible: false, reason: "Too many tab switches." }
  }

  if (input.passingScore !== null && input.passingScore !== undefined) {
    const score = input.score ?? 0
    if (score < input.passingScore) {
      return { eligible: false, reason: "Passing score not met." }
    }
  }

  return { eligible: true, reason: null }
}
