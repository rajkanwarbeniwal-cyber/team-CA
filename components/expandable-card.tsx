'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

interface ExpandableCardProps {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  description: string
  details?: string | React.ReactNode
  features?: string[]
  cta?: {
    text: string
    href?: string
    onClick?: () => void
  }
  className?: string
}

export function ExpandableCard({
  title,
  subtitle,
  icon,
  description,
  details,
  features,
  cta,
  className = ''
}: ExpandableCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <motion.div
      layout
      onClick={() => setIsExpanded(!isExpanded)}
      className={`bg-card rounded-xl border border-border overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-primary/50 ${className}`}
      whileHover={{ y: -4 }}
    >
      {/* Header */}
      <div className="p-6 flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-start gap-3 mb-2">
            {icon && <div className="text-2xl flex-shrink-0">{icon}</div>}
            <div>
              <h3 className="text-lg font-bold text-foreground">{title}</h3>
              {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
            </div>
          </div>
          <p className="text-foreground/80">{description}</p>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="flex-shrink-0 text-primary mt-1"
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </div>

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border px-6 py-4 bg-background/50">
              {/* Details */}
              {details && (
                <div className="mb-4 pb-4 border-b border-border">
                  {typeof details === 'string' ? (
                    <p className="text-foreground whitespace-pre-wrap leading-relaxed">{details}</p>
                  ) : (
                    details
                  )}
                </div>
              )}

              {/* Features List */}
              {features && features.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-foreground mb-3">Key Features:</h4>
                  <ul className="space-y-2">
                    {features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-primary font-bold text-sm mt-0.5">✓</span>
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* CTA Button */}
              {cta && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    cta.onClick?.()
                    if (cta.href) {
                      window.location.href = cta.href
                    }
                  }}
                  className="w-full bg-primary text-primary-foreground font-semibold py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  {cta.text}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
