"use client"

// FOR TRACKING TAB SWITCHES AND BLUR EVENTS
"use client" // this hook runs on the client

import { useEffect, useState } from "react" // React utilities
import { saveTabSwitchCountAction } from "@/lib/attempt/actions/saveTabSwitchCountAction" // server action for tab count

export function useProctoring(attemptId: string, enabled: boolean) { // custom hook signature
  const [tabSwitches, setTabSwitches] = useState(0) // state for tab switches
  const [blurScreen, setBlurScreen] = useState(false) // state for blur overlay

  useEffect(() => { // attach listeners when enabled
    if (!enabled) return // skip if not enabled

    let counted = false // prevent double counting

    const handleLeave = () => { // when user leaves tab
      if (counted) return // avoid duplicates
      counted = true // mark counted
      setTabSwitches((prev) => prev + 1) // increment tab switch count
      setBlurScreen(true) // show blur overlay
      setTimeout(() => setBlurScreen(false), 3000) // hide blur after 3s
    }

    const handleReturn = () => { // when user returns
      counted = false // allow counting again
    }

    const handleVisibility = () => { // when visibility changes
      if (document.hidden) handleLeave() // map hidden state to leave handler
      else handleReturn() // map visible state to return handler
    }

    window.addEventListener("blur", handleLeave) // listen for blur
    window.addEventListener("focus", handleReturn) // listen for focus
    document.addEventListener("visibilitychange", handleVisibility) // listen for visibility changes

    return () => { // cleanup listeners
      window.removeEventListener("blur", handleLeave) // remove blur listener
      window.removeEventListener("focus", handleReturn) // remove focus listener
      document.removeEventListener("visibilitychange", handleVisibility) // remove visibility listener
    }
  }, [enabled]) // only re-run if enabled changes

  useEffect(() => { // persist tab count
    if (!attemptId) return // skip if no attempt
    void saveTabSwitchCountAction(attemptId, tabSwitches) // send count to server
  }, [attemptId, tabSwitches]) // re-run on changes

  return { tabSwitches, blurScreen, setTabSwitches } // expose values
}
