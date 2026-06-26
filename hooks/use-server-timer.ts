import { useEffect, useState, useRef, useCallback } from 'react'
import { validateExamTimer } from '@/app/actions/exam-timer-validate'

interface ServerTimerState {
  remainingSeconds: number
  serverTime: number
  isExpired: boolean
  isValidating: boolean
  error: string | null
}

/**
 * Hook that syncs client timer with server time every 30 seconds
 * Prevents client-side clock manipulation
 */
export function useServerTimer({
  attemptId,
  timerMode,
  totalDurationMinutes,
  enabled = true,
}: {
  attemptId: string
  timerMode: 'total' | 'per_question'
  totalDurationMinutes: number
  enabled?: boolean
}) {
  const [state, setState] = useState<ServerTimerState>({
    remainingSeconds: 0,
    serverTime: 0,
    isExpired: false,
    isValidating: false,
    error: null,
  })

  const localStartRef = useRef<number | null>(null)
  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const clockSkewRef = useRef<number>(0)

  // Validate timer with server
  const performValidation = useCallback(async () => {
    if (!enabled) return

    setState((prev) => ({ ...prev, isValidating: true }))

    try {
      const result = await validateExamTimer(attemptId, timerMode, totalDurationMinutes)

      // Calculate clock skew (difference between client and server time)
      const clientTime = Date.now()
      const skew = result.serverTime - clientTime
      clockSkewRef.current = skew

      // Update state with server-validated time
      setState({
        remainingSeconds: result.remainingSeconds,
        serverTime: result.serverTime,
        isExpired: result.isExpired,
        isValidating: false,
        error: null,
      })

      // Store local start time for subsequent calculations
      if (!localStartRef.current) {
        const adjustedStartTime = result.serverTime - (totalDurationMinutes * 60 - result.remainingSeconds) * 1000
        localStartRef.current = adjustedStartTime
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Timer validation failed'
      setState((prev) => ({
        ...prev,
        isValidating: false,
        error: message,
      }))
    }
  }, [attemptId, timerMode, totalDurationMinutes, enabled])

  // Initial validation on mount
  useEffect(() => {
    if (!enabled) return
    performValidation()
  }, [enabled, performValidation])

  // Validate every 30 seconds to catch clock manipulation
  useEffect(() => {
    if (!enabled) return

    validationTimeoutRef.current = setInterval(() => {
      performValidation()
    }, 30000) // 30 seconds

    return () => {
      if (validationTimeoutRef.current) {
        clearInterval(validationTimeoutRef.current)
      }
    }
  }, [enabled, performValidation])

  // Calculate local remaining seconds between validations
  // Accounts for clock skew discovered during last validation
  const getAdjustedRemainingSeconds = useCallback(() => {
    if (!localStartRef.current || state.isExpired) {
      return state.remainingSeconds
    }

    const adjustedNow = Date.now() + clockSkewRef.current
    const totalDurationMs = state.remainingSeconds * 1000 + (adjustedNow - state.serverTime)
    const totalDurationSeconds = Math.floor(totalDurationMs / 1000)

    return Math.max(0, totalDurationSeconds)
  }, [state.remainingSeconds, state.serverTime, state.isExpired])

  return {
    ...state,
    getAdjustedRemainingSeconds,
    syncWithServer: performValidation,
  }
}
