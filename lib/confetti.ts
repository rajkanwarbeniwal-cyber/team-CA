import confetti from "canvas-confetti"

export function celebrate() {
  const duration = 1800
  const end = Date.now() + duration

  const colors = ["#2563eb", "#16a34a", "#f59e0b"]

  ;(function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors,
    })
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors,
    })
    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  })()

  confetti({
    particleCount: 120,
    spread: 80,
    origin: { y: 0.6 },
    colors,
  })
}
