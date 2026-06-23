"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

type Language = "en" | "hi"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => Promise<void>
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Translation dictionary
const translations: Record<Language, Record<string, string>> = {
  en: {
    "nav.dashboard": "Dashboard",
    "nav.tests": "Tests",
    "nav.daily-quiz": "Daily Quiz",
    "nav.results": "Results",
    "nav.analytics": "Analytics",
    "nav.community": "Community",
    "nav.admin": "Admin",
    "exam.choose": "Choose Your Exam",
    "exam.select-category": "Select an exam category to begin",
    "exam.select-exam": "Pick your target exam",
    "exam.choose-test": "Choose a mock test",
    "exam.questions": "Questions",
    "exam.minutes": "minutes",
    "exam.start": "Start Test",
    "daily.challenge": "Daily Challenge",
    "daily.completed": "Completed!",
    "daily.start": "Start Today's Quiz",
    "daily.streak": "Current Streak",
    "daily.best": "Best Streak",
    "daily.points": "Total Points",
    "results.score": "Your Score",
    "results.correct": "Correct",
    "results.incorrect": "Incorrect",
    "results.skipped": "Skipped",
    "results.rank": "Your Rank",
    "results.review": "Answer Review",
    "auth.signin": "Sign In",
    "auth.signup": "Sign Up",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.phone": "Phone OTP",
    "button.back": "Back",
    "button.submit": "Submit",
    "button.next": "Next",
    "button.bookmark": "Bookmark",
    "button.clear": "Clear",
    "button.signout": "Sign Out",
  },
  hi: {
    "nav.dashboard": "डैशबोर्ड",
    "nav.tests": "परीक्षाएं",
    "nav.daily-quiz": "दैनिक क्विज",
    "nav.results": "परिणाम",
    "nav.analytics": "विश्लेषण",
    "nav.community": "समुदाय",
    "nav.admin": "प्रशासन",
    "exam.choose": "अपनी परीक्षा चुनें",
    "exam.select-category": "शुरू करने के लिए एक परीक्षा श्रेणी चुनें",
    "exam.select-exam": "अपनी लक्ष्य परीक्षा चुनें",
    "exam.choose-test": "एक मॉक परीक्षा चुनें",
    "exam.questions": "प्रश्न",
    "exam.minutes": "मिनट",
    "exam.start": "परीक्षा शुरू करें",
    "daily.challenge": "दैनिक चुनौती",
    "daily.completed": "पूर्ण!",
    "daily.start": "आज की क्विज शुरू करें",
    "daily.streak": "वर्तमान स्ट्रीक",
    "daily.best": "सर्वश्रेष्ठ स्ट्रीक",
    "daily.points": "कुल अंक",
    "results.score": "आपका स्कोर",
    "results.correct": "सही",
    "results.incorrect": "गलत",
    "results.skipped": "छोड़ा गया",
    "results.rank": "आपकी रैंक",
    "results.review": "उत्तर समीक्षा",
    "auth.signin": "साइन इन करें",
    "auth.signup": "साइन अप करें",
    "auth.email": "ईमेल",
    "auth.password": "पासवर्ड",
    "auth.phone": "फोन OTP",
    "button.back": "वापस",
    "button.submit": "जमा करें",
    "button.next": "अगला",
    "button.bookmark": "बुकमार्क",
    "button.clear": "साफ करें",
    "button.signout": "साइन आउट",
  },
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en")
  const [mounted, setMounted] = useState(false)
  const supabase = createClient()

  // Load language from localStorage and profile on mount
  useEffect(() => {
    async function loadLanguage() {
      const stored = localStorage.getItem("language") as Language | null
      if (stored) {
        setLanguageState(stored)
      } else {
        // Try to load from profile
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("metadata")
            .eq("id", user.id)
            .single()

          const profileLang = (profile?.metadata as any)?.language as Language | undefined
          if (profileLang) {
            setLanguageState(profileLang)
            localStorage.setItem("language", profileLang)
          }
        }
      }
      setMounted(true)
    }

    loadLanguage()
  }, [supabase])

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("language", lang)

    // Persist to profile if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from("profiles")
        .update({ metadata: { language: lang } })
        .eq("id", user.id)
    }
  }

  const t = (key: string): string => {
    return translations[language][key] ?? key
  }

  if (!mounted) return null

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider")
  }
  return context
}
