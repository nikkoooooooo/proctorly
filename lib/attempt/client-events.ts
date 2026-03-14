"use client";

export async function sendAttemptEvent(
  attemptId: string,
  type: string,
  payload?: Record<string, unknown>,
) {
  if (!attemptId) return;
  try {
    await fetch(`/api/attempts/${attemptId}/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, payload }),
    });
  } catch (error) {
    console.warn("Attempt event failed:", error);
  }
}
