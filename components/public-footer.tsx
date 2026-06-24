"use client"

import Link from "next/link"
import { useLanguage } from "@/lib/language-context"
import { Mail, Phone, MapPin } from "lucide-react"

export function PublicFooter() {
  const { t } = useLanguage()

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="font-bold text-lg text-foreground mb-4">Taksha</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Empower your exam preparation with our comprehensive mock tests and learning platform.
            </p>
            <p className="text-xs text-muted-foreground font-semibold">
              www.taksha.edu
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Platform</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="/shop" className="text-sm text-muted-foreground hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Blog</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Help Center</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Guides</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link href="/privacy-policy" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms-conditions" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms & Conditions</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Cookie Policy</Link></li>
              <li><Link href="/auth/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">Sign In</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Contact</h4>
            <div className="space-y-3">
              <a 
                href="tel:+917737775985" 
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
              >
                <Phone className="w-4 h-4 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span>+91 7737775985</span>
              </a>
              <a 
                href="mailto:contact@taksha.edu" 
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
              >
                <Mail className="w-4 h-4 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span>contact@taksha.edu</span>
              </a>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Taksha Educational Services, India</span>
              </div>
              <div className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
                <p className="font-semibold mb-2">Hours:</p>
                <p>Mon-Fri: 9 AM - 6 PM IST</p>
                <p>Sat-Sun: 10 AM - 4 PM IST</p>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border my-8"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © {new Date().getFullYear()} Taksha Educational Services. All rights reserved. | Domain: taksha.edu
          </p>
          <div className="flex gap-6">
            <a 
              href="https://facebook.com" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium" 
              title="Facebook"
            >
              f
            </a>
            <a 
              href="https://twitter.com" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium" 
              title="Twitter"
            >
              𝕏
            </a>
            <a 
              href="https://linkedin.com" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium" 
              title="LinkedIn"
            >
              in
            </a>
            <a 
              href="https://instagram.com" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium" 
              title="Instagram"
            >
              IG
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
