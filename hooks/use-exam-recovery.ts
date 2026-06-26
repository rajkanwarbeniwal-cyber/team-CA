import { useEffect, useRef, useCallback } from 'react'
import { useExamStore } from '@/lib/exam-store'

const STORAGE_KEY = 'taksha-exam-recovery'
const AUTO_SAVE_INTERVAL = 10000 // 10 seconds in milliseconds

interface ExamRecoveryData {
  timestamp: number
  attemptId: string
  testId: string
  title: string
  timerMode: string
  perQuestionSeconds: number
  durationMinutes: number
  questions: any[]
  answers: Record<string, any>
  currentIndex: number
  startedAt: number
  deadline: number | null
  perQuestionDeadline: number | null
}

/**
 * Hook for auto-saving exam state and recovering from crashes
 * Debounces saves to localStorage every 10 seconds
 * Only rehydrates if exam duration hasn't expired
 */
export function useExamRecovery() {
  const store = useExamStore()
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hasSavedRef = useRef(false)

  // Auto-save to localStorage
  useEffect(() => {
    const saveExamState = () => {
      if (!store.attemptId || !store.testId) return

      const recoveryData: ExamRecoveryData = {
        timestamp: Date.now(),
        attemptId: store.attemptId,
        testId: store.testId,
        title: store.title,
        timerMode: store.timerMode,
        perQuestionSeconds: store.perQuestionSeconds,
        durationMinutes: store.durationMinutes,
        questions: store.questions,
        answers: store.answers,
        currentIndex: store.currentIndex,
        startedAt: store.startedAt!,
        deadline: store.deadline,
        perQuestionDeadline: store.perQuestionDeadline,
      }

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(recoveryData))
        hasSavedRef.current = true
      } catch (error) {
        console.error('[v0] Failed to save exam state:', error)
      }
    }

    // Debounce saves
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(saveExamState, AUTO_SAVE_INTERVAL)

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [
    store.attemptId,
    store.testId,
    store.title,
    store.timerMode,
    store.perQuestionSeconds,
    store.durationMinutes,
    store.questions,
    store.answers,
    store.currentIndex,
    store.startedAt,
    store.deadline,
    store.perQuestionDeadline,
  ])

  // Attempt to recover saved state on mount
  const recoverExamState = useCallback((): boolean => {
    if (hasSavedRef.current) {
      // Already hydrated from Zustand persist
      return false
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (!saved) return false

      const recoveryData: ExamRecoveryData = JSON.parse(saved)

      // Check if exam duration has expired
      const elapsedSeconds = (Date.now() - recoveryData.startedAt) / 1000
      const totalDurationSeconds = recoveryData.durationMinutes * 60

      if (elapsedSeconds > totalDurationSeconds) {
        // Exam duration has expired, don't recover
        localStorage.removeItem(STORAGE_KEY)
        return false
      }

      // Recover the state
      store.initExam({
        attemptId: recoveryData.attemptId,
        testId: recoveryData.testId,
        title: recoveryData.title,
        timerMode: recoveryData.timerMode as any,
        perQuestionSeconds: recoveryData.perQuestionSeconds,
        durationMinutes: recoveryData.durationMinutes,
        questions: recoveryData.questions,
      })

      // Restore answers and navigation state
      store.answers = recoveryData.answers
      store.currentIndex = recoveryData.currentIndex

      hasSavedRef.current = true
      console.log('[v0] Exam state recovered from localStorage')
      return true
    } catch (error) {
      console.error('[v0] Failed to recover exam state:', error)
      return false
    }
  }, [store])

  // Clean up on exam completion
  const clearRecovery = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    hasSavedRef.current = false
  }, [])

  return {
    recoverExamState,
    clearRecovery,
  }
}
