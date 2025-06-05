import { useEffect, useRef } from 'react'
import { cn } from '@/utilities'

interface SimpleCanvasEffectProps {
  className?: string
  dotSize?: number
  animationSpeed?: number
}

export function SimpleCanvasEffect({ 
  className,
  dotSize = 6,
  animationSpeed = 3
}: SimpleCanvasEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const dots: Array<{
      x: number
      y: number
      opacity: number
      delay: number
    }> = []

    // Create dot grid
    const spacing = 20
    const cols = Math.ceil(canvas.width / spacing)
    const rows = Math.ceil(canvas.height / spacing)

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const centerX = canvas.width / 2
        const centerY = canvas.height / 2
        const x = i * spacing
        const y = j * spacing
        
        // Calculate distance from center for animation delay
        const distance = Math.sqrt(
          Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
        )
        
        dots.push({
          x,
          y,
          opacity: 0,
          delay: distance * 0.01 + Math.random() * 0.5
        })
      }
    }

    let startTime = Date.now()

    const animate = () => {
      const currentTime = (Date.now() - startTime) / 1000
      
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = 'white'

      dots.forEach(dot => {
        const timeSinceStart = currentTime * animationSpeed
        
        if (timeSinceStart > dot.delay) {
          const progress = Math.min((timeSinceStart - dot.delay) * 2, 1)
          dot.opacity = progress * (0.3 + Math.random() * 0.7)
          
          ctx.globalAlpha = dot.opacity
          ctx.beginPath()
          ctx.arc(dot.x, dot.y, dotSize / 2, 0, Math.PI * 2)
          ctx.fill()
        }
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationId)
    }
  }, [dotSize, animationSpeed])

  return (
    <canvas
      ref={canvasRef}
      className={cn('absolute inset-0 w-full h-full', className)}
    />
  )
}
