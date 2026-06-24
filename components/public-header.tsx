"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Globe, Menu, X, Phone, Mail } from "lucide-react"

export function PublicHeader() {
  const { theme, setTheme } = useTheme()
  const { language, setLanguage } = useLanguage()
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <>
      {/* Top Bar with Contact Info */}
      <div className="hidden md:block bg-primary/5 border-b border-border py-2">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <a href="mailto:contact@taksha.edu" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
              <Mail className="w-4 h-4" />
              contact@taksha.edu
            </a>
            <a href="tel:+917737775985" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
              <Phone className="w-4 h-4" />
              +91 7737775985
            </a>
          </div>
          <span className="text-muted-foreground">www.taksha.edu</span>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
                T
              </div>
              <span className="hidden font-bold text-foreground sm:inline">Taksha</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Home
              </Link>
              <Link href="/shop" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Shop
              </Link>
              <Link href="/about" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                About Us
              </Link>
              <Link href="/contact" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Contact Us
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Language Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLanguage(language === "en" ? "hi" : "en")}
                title={`Switch to ${language === "en" ? "Hindi" : "English"}`}
              >
                <Globe className="h-4 w-4" />
                <span className="sr-only">Language</span>
              </Button>

              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                <span className="sr-only">Toggle theme</span>
              </Button>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>

              {/* Sign In / Sign Up */}
              <Link href="/auth/login" className="hidden sm:block">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <nav className="md:hidden border-t border-border bg-background/95 py-4">
              <div className="space-y-2 px-4">
                <Link href="/" className="block px-4 py-2 rounded-lg hover:bg-accent/10 text-foreground">
                  Home
                </Link>
                <Link href="/shop" className="block px-4 py-2 rounded-lg hover:bg-accent/10 text-foreground">
                  Shop
                </Link>
                <Link href="/about" className="block px-4 py-2 rounded-lg hover:bg-accent/10 text-foreground">
                  About Us
                </Link>
                <Link href="/contact" className="block px-4 py-2 rounded-lg hover:bg-accent/10 text-foreground">
                  Contact Us
                </Link>
                <Link href="/auth/login" className="block px-4 py-2">
                  <Button className="w-full">Sign In</Button>
                </Link>
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Mobile Contact Bar */}
      <div className="md:hidden bg-primary/5 border-b border-border py-2 px-4 flex items-center justify-between text-xs">
        <a href="mailto:contact@taksha.edu" className="flex items-center gap-1 text-foreground hover:text-primary">
          <Mail className="w-3 h-3" />
          Email
        </a>
        <a href="tel:+917737775985" className="flex items-center gap-1 text-foreground hover:text-primary">
          <Phone className="w-3 h-3" />
          Call
        </a>
      </div>
    </>
  )
}
