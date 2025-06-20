import { useEffect, useRef } from 'react'
import { cn } from '@/shared/utils'

interface SimpleCanvasEffectProps {
	className?: string
	dotSize?: number
	animationSpeed?: number
	colorful?: boolean
}

export function SimpleCanvasEffect({
	className,
	dotSize = 6,
	animationSpeed = 3,
	colorful = false,
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
			color: string
			hue: number
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
				const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2))

				// Generate color based on position and randomness
				const hue = colorful
					? (distance * 0.05 + Math.random() * 40 + 120) % 360 // Green to grey range (120-160)
					: 0
				const color = colorful
					? `hsl(${hue}, 30%, 45%)` // More muted, greyish-green
					: 'white'

				dots.push({
					x,
					y,
					opacity: 0,
					delay: distance * 0.01 + Math.random() * 0.5,
					color,
					hue,
				})
			}
		}

		let startTime = Date.now()

		const animate = () => {
			const currentTime = (Date.now() - startTime) / 1000

			ctx.clearRect(0, 0, canvas.width, canvas.height)

			dots.forEach(dot => {
				const timeSinceStart = currentTime * animationSpeed

				if (timeSinceStart > dot.delay) {
					const progress = Math.min((timeSinceStart - dot.delay) * 2, 1)
					dot.opacity = progress * (0.3 + Math.random() * 0.7)

					// Add subtle color animation for colorful mode
					if (colorful) {
						const animatedHue = (dot.hue + currentTime * 5) % 360 // Slower color animation
						const saturation = 25 + Math.sin(currentTime + dot.delay) * 10 // Subtle saturation variation
						const lightness = 40 + Math.sin(currentTime * 1.5 + dot.delay) * 8 // Subtle lightness variation
						ctx.fillStyle = `hsl(${animatedHue}, ${saturation}%, ${lightness}%)`
					} else {
						ctx.fillStyle = dot.color
					}

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

	return <canvas ref={canvasRef} className={cn('absolute inset-0 w-full h-full', className)} />
}
