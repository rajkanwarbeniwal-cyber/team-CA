"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { ExamQuestion, OptionKey, TimerMode } from "@/lib/types"

interface AnswerState {
  selected: OptionKey | null
  bookmarked: boolean
  visited: boolean
}

interface ExamState {
  // session identity
  attemptId: string | null
  testId: string | null
  title: string
  timerMode: TimerMode
  perQuestionSeconds: number
  durationMinutes: number

  questions: ExamQuestion[]
  answers: Record<string, AnswerState>
  currentIndex: number

  // timing
  startedAt: number | null // epoch ms
  deadline: number | null // epoch ms for total mode
  perQuestionDeadline: number | null // epoch ms for per-question mode
  finished: boolean

  // actions
  initExam: (payload: {
    attemptId: string
    testId: string
    title: string
    timerMode: TimerMode
    perQuestionSeconds: number
    durationMinutes: number
    questions: ExamQuestion[]
  }) => void
  hydrateVisited: (questionId: string) => void
  selectOption: (questionId: string, option: OptionKey) => void
  clearOption: (questionId: string) => void
  toggleBookmark: (questionId: string) => void
  goTo: (index: number) => void
  next: () => void
  prev: () => void
  setPerQuestionDeadline: (ts: number) => void
  finishExam: () => void
  reset: () => void
  // selectors (computed helpers)
  answeredCount: () => number
  progressPercent: () => number
}

export const useExamStore = create<ExamState>()(
  persist(
    (set, get) => ({
      attemptId: null,
      testId: null,
      title: "",
      timerMode: "total",
      perQuestionSeconds: 60,
      durationMinutes: 30,
      questions: [],
      answers: {},
      currentIndex: 0,
      startedAt: null,
      deadline: null,
      perQuestionDeadline: null,
      finished: false,

      initExam: (payload) => {
        const now = Date.now()
        const answers: Record<string, AnswerState> = {}
        payload.questions.forEach((q, i) => {
          answers[q.id] = { selected: null, bookmarked: false, visited: i === 0 }
        })
        set({
          attemptId: payload.attemptId,
          testId: payload.testId,
          title: payload.title,
          timerMode: payload.timerMode,
          perQuestionSeconds: payload.perQuestionSeconds,
          durationMinutes: payload.durationMinutes,
          questions: payload.questions,
          answers,
          currentIndex: 0,
          startedAt: now,
          deadline: payload.timerMode === "total" ? now + payload.durationMinutes * 60_000 : null,
          perQuestionDeadline:
            payload.timerMode === "per_question" ? now + payload.perQuestionSeconds * 1000 : null,
          finished: false,
        })
      },

      hydrateVisited: (questionId) =>
        set((s) => ({
          answers: {
            ...s.answers,
            [questionId]: { ...s.answers[questionId], visited: true },
          },
        })),

      selectOption: (questionId, option) =>
        set((s) => ({
          answers: {
            ...s.answers,
            [questionId]: { ...s.answers[questionId], selected: option, visited: true },
          },
        })),

      clearOption: (questionId) =>
        set((s) => ({
          answers: {
            ...s.answers,
            [questionId]: { ...s.answers[questionId], selected: null },
          },
        })),

      toggleBookmark: (questionId) =>
        set((s) => ({
          answers: {
            ...s.answers,
            [questionId]: { ...s.answers[questionId], bookmarked: !s.answers[questionId]?.bookmarked },
          },
        })),

      goTo: (index) => {
        const { questions, timerMode, perQuestionSeconds } = get()
        if (index < 0 || index >= questions.length) return
        const q = questions[index]
        set((s) => ({
          currentIndex: index,
          answers: { ...s.answers, [q.id]: { ...s.answers[q.id], visited: true } },
          // reset per-question timer when navigating in per-question mode
          perQuestionDeadline:
            timerMode === "per_question" ? Date.now() + perQuestionSeconds * 1000 : s.perQuestionDeadline,
        }))
      },

      next: () => {
        const { currentIndex, questions } = get()
        if (currentIndex < questions.length - 1) get().goTo(currentIndex + 1)
      },

      prev: () => {
        const { currentIndex } = get()
        if (currentIndex > 0) get().goTo(currentIndex - 1)
      },

      setPerQuestionDeadline: (ts) => set({ perQuestionDeadline: ts }),

      finishExam: () => set({ finished: true }),

      reset: () =>
        set({
          attemptId: null,
          testId: null,
          title: "",
          questions: [],
          answers: {},
          currentIndex: 0,
          startedAt: null,
          deadline: null,
          perQuestionDeadline: null,
          finished: false,
        }),

      answeredCount: () => {
        const { answers } = get()
        return Object.values(answers).filter((a) => a.selected !== null).length
      },

      progressPercent: () => {
        const { questions } = get()
        if (questions.length === 0) return 0
        return Math.round((get().answeredCount() / questions.length) * 100)
      },
    }),
    {
      name: "examforge-active-exam",
      partialize: (s) => ({
        attemptId: s.attemptId,
        testId: s.testId,
        title: s.title,
        timerMode: s.timerMode,
        perQuestionSeconds: s.perQuestionSeconds,
        durationMinutes: s.durationMinutes,
        questions: s.questions,
        answers: s.answers,
        currentIndex: s.currentIndex,
        startedAt: s.startedAt,
        deadline: s.deadline,
        perQuestionDeadline: s.perQuestionDeadline,
        finished: s.finished,
      }),
    },
  ),
)
