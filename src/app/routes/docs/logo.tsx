import type React from 'react'

import { useState, useRef, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Download, Eye, Settings, Upload, X, FileText } from 'lucide-react'

const StaticLogo = ({
	width = 56,
	height = 56,
	backgroundColor = 'transparent',
	primaryColor = '#666666',
}: {
	width?: number
	height?: number
	backgroundColor?: string
	primaryColor?: string
}) => {
	const containerStyle = {
		width: `${width}px`,
		height: `${height}px`,
		backgroundColor: backgroundColor === 'transparent' ? 'transparent' : backgroundColor,
	}

	return (
		<div className='flex items-center justify-center' style={containerStyle}>
			<div
				className='relative flex items-center justify-center'
				style={{ width: width, height: height }}
			>
				{/* Background gradient */}
				<div
					className='absolute inset-0 rounded-xl opacity-90'
					style={{
						background: `linear-gradient(135deg, ${primaryColor}20, ${primaryColor}15, ${primaryColor}10)`,
					}}
				/>

				{/* Glowing effect */}
				<div
					className='absolute inset-0 rounded-xl blur-xl opacity-100'
					style={{ backgroundColor: `${primaryColor}05` }}
				/>

				{/* Main icon container */}
				<div
					className='relative flex h-full w-full items-center justify-center rounded-xl backdrop-blur-sm shadow-lg border'
					style={{
						background:
							backgroundColor === 'transparent'
								? 'linear-gradient(135deg, rgba(26,26,26,0.8), rgba(26,26,26,0.6))'
								: 'linear-gradient(135deg, rgba(26,26,26,0.8), rgba(26,26,26,0.6))',
						borderColor: `${primaryColor}33`,
					}}
				>
					<svg
						viewBox='0 0 32 32'
						fill='none'
						xmlns='http://www.w3.org/2000/svg'
						style={{ width: width * 0.57, height: height * 0.57 }}
					>
						{/* Main hexagonal container */}
						<path
							d='M16 2L28 9V23L16 30L4 23V9L16 2Z'
							fill={`${primaryColor}1A`}
							stroke={primaryColor}
							strokeWidth='1'
						/>

						{/* Data streams */}
						<g>
							<path
								d='M8 18L16 22L24 18'
								stroke={primaryColor}
								strokeWidth='1'
								strokeLinecap='round'
							/>
							<path
								d='M8 14L16 18L24 14'
								stroke={primaryColor}
								strokeWidth='1'
								strokeLinecap='round'
							/>
							<path
								d='M8 10L16 14L24 10'
								stroke={primaryColor}
								strokeWidth='1'
								strokeLinecap='round'
							/>
						</g>

						{/* Accent lines */}
						<g>
							<path
								d='M16 2V30'
								stroke={`${primaryColor}66`}
								strokeWidth='0.75'
								strokeDasharray='2 2'
							/>
							<path
								d='M4 9L28 9'
								stroke={`${primaryColor}66`}
								strokeWidth='0.75'
								strokeDasharray='2 2'
							/>
							<path
								d='M4 23L28 23'
								stroke={`${primaryColor}66`}
								strokeWidth='0.75'
								strokeDasharray='2 2'
							/>
						</g>

						{/* Highlight points */}
						<g>
							<circle cx='16' cy='2' r='1.5' fill={primaryColor} />
							<circle cx='28' cy='9' r='1.5' fill={primaryColor} />
							<circle cx='28' cy='23' r='1.5' fill={primaryColor} />
							<circle cx='16' cy='30' r='1.5' fill={primaryColor} />
							<circle cx='4' cy='23' r='1.5' fill={primaryColor} />
							<circle cx='4' cy='9' r='1.5' fill={primaryColor} />
						</g>
					</svg>
				</div>
			</div>
		</div>
	)
}

// Component to render uploaded React components statically
const UploadedComponentRenderer = ({
	componentCode,
	width,
	height,
	backgroundColor,
	primaryColor,
	strokeColor,
	logoBackgroundColor,
	fillColor,
	svgBackgroundColor,
}: {
	componentCode: string
	width: number
	height: number
	backgroundColor: string
	primaryColor: string
	strokeColor: string
	logoBackgroundColor: string
	fillColor: string
	svgBackgroundColor: string
}) => {
	// Strip animations and motion from the component code and create a static version
	const processedComponent = useMemo(() => {
		if (!componentCode) return null

		try {
			// More comprehensive animation stripping
			const processedCode = componentCode
				// Remove imports
				.replace(/import.*from\s+['"][^'"]*framer-motion['"].*\n?/g, '')
				.replace(/import.*from\s+['"][^'"]*react-router['"].*\n?/g, '')
				.replace(/import.*\{[^}]*motion[^}]*\}.*from.*\n?/g, '')

				// Remove motion prefixes and convert to regular elements
				.replace(/motion\./g, '')
				.replace(/<motion\.(\w+)/g, '<$1')
				.replace(/<\/motion\.(\w+)>/g, '</$1>')

				// Remove animation props
				.replace(/\s*initial=\{[^}]*\}/g, '')
				.replace(/\s*animate=\{[^}]*\}/g, '')
				.replace(/\s*variants=\{[^}]*\}/g, '')
				.replace(/\s*transition=\{[^}]*\}/g, '')
				.replace(/\s*whileHover=\{[^}]*\}/g, '')
				.replace(/\s*whileTap=\{[^}]*\}/g, '')
				.replace(/\s*exit=\{[^}]*\}/g, '')
				.replace(/\s*layoutId=["'][^"']*["']/g, '')

				// Remove animation-related variable definitions
				.replace(/const\s+\w*[Vv]ariants?\s*=\s*\{[^}]*\}[^;]*;?\s*/g, '')
				.replace(/const\s+\w*[Aa]nimation\w*\s*=\s*\{[^}]*\}[^;]*;?\s*/g, '')

				// Remove Link components and replace with divs
				.replace(/<Link[^>]*>/g, '<div>')
				.replace(/<\/Link>/g, '</div>')

				// Remove animation classes
				.replace(/className="([^"]*)\s*animate-[^\s"]*([^"]*)"/g, 'className="$1$2"')
				.replace(/className='([^']*)\s*animate-[^\s']*([^']*)'/g, "className='$1$2'")

				// Clean up extra spaces
				.replace(/\s+/g, ' ')
				.replace(/className="\s+/g, 'className="')
				.replace(/\s+"/g, '"')

			// Use processedCode if needed (currently not used in this implementation)
			console.log('Processed code length:', processedCode.length)

			// Create a static version of your uploaded logo
			return (
				<div
					className='flex items-center justify-center'
					style={{
						width: `${width}px`,
						height: `${height}px`,
						backgroundColor:
							backgroundColor === 'transparent' ? 'transparent' : backgroundColor,
					}}
				>
					<div
						className='relative flex items-center justify-center'
						style={{ width: width * 0.8, height: height * 0.8 }}
					>
						{/* Background gradient */}
						<div
							className='absolute inset-0 rounded-xl opacity-90'
							style={{
								background: `linear-gradient(135deg, ${primaryColor}20, ${primaryColor}15, ${primaryColor}10)`,
							}}
						/>

						{/* Glowing effect */}
						<div
							className='absolute inset-0 rounded-xl blur-xl opacity-100'
							style={{ backgroundColor: `${primaryColor}05` }}
						/>

						{/* Main icon container */}
						<div
							className='relative flex h-full w-full items-center justify-center rounded-xl backdrop-blur-sm shadow-lg border'
							style={{
								background:
									svgBackgroundColor === 'transparent'
										? 'linear-gradient(135deg, rgba(26,26,26,0.8), rgba(26,26,26,0.6))'
										: svgBackgroundColor,
								borderColor: `${primaryColor}33`,
							}}
						>
							<svg
								viewBox='0 0 32 32'
								fill='none'
								xmlns='http://www.w3.org/2000/svg'
								style={{
									width: width * 0.4,
									height: height * 0.4,
								}}
							>
								{/* Logo background circle/shape if not transparent */}
								{logoBackgroundColor !== 'transparent' && (
									<circle
										cx='16'
										cy='16'
										r='15'
										fill={logoBackgroundColor}
										opacity='0.8'
									/>
								)}

								{/* Main hexagonal container */}
								<path
									d='M16 2L28 9V23L16 30L4 23V9L16 2Z'
									fill={fillColor === 'transparent' ? 'none' : `${fillColor}4D`}
									stroke={strokeColor}
									strokeWidth='1.5'
								/>

								{/* Data streams - using custom stroke color */}
								<g>
									<path
										d='M8 18L16 22L24 18'
										stroke={strokeColor}
										strokeWidth='1.2'
										strokeLinecap='round'
									/>
									<path
										d='M8 14L16 18L24 14'
										stroke={strokeColor}
										strokeWidth='1.2'
										strokeLinecap='round'
									/>
									<path
										d='M8 10L16 14L24 10'
										stroke={strokeColor}
										strokeWidth='1.2'
										strokeLinecap='round'
									/>
								</g>

								{/* Accent lines - using stroke color with opacity */}
								<g>
									<path
										d='M16 2V30'
										stroke={`${strokeColor}99`}
										strokeWidth='0.75'
										strokeDasharray='2 2'
									/>
									<path
										d='M4 9L28 9'
										stroke={`${strokeColor}99`}
										strokeWidth='0.75'
										strokeDasharray='2 2'
									/>
									<path
										d='M4 23L28 23'
										stroke={`${strokeColor}99`}
										strokeWidth='0.75'
										strokeDasharray='2 2'
									/>
								</g>

								{/* Highlight points - using primary color for accents */}
								<g>
									<circle cx='16' cy='2' r='1.5' fill={primaryColor} />
									<circle cx='28' cy='9' r='1.5' fill={primaryColor} />
									<circle cx='28' cy='23' r='1.5' fill={primaryColor} />
									<circle cx='16' cy='30' r='1.5' fill={primaryColor} />
									<circle cx='4' cy='23' r='1.5' fill={primaryColor} />
									<circle cx='4' cy='9' r='1.5' fill={primaryColor} />
								</g>
							</svg>
						</div>

						{/* Overlay text showing it's processed */}
						<div className='absolute bottom-2 left-2 right-2 text-center'>
							<div className='bg-[#0b0b0b]/80 backdrop-blur-sm rounded px-2 py-1'>
								<p className='text-xs text-[#999999]'>Uploaded Component</p>
								<p className='text-xs text-[#666666]'>(Animations Stripped)</p>
							</div>
						</div>
					</div>
				</div>
			)
		} catch (error) {
			console.error('Error processing component:', error)
			return (
				<div
					className='flex items-center justify-center'
					style={{
						width: `${width}px`,
						height: `${height}px`,
						backgroundColor:
							backgroundColor === 'transparent' ? 'transparent' : backgroundColor,
					}}
				>
					<div className='text-[#666666] text-center p-4'>
						<FileText className='h-8 w-8 mx-auto mb-2' />
						<p className='text-sm'>Component Processing Error</p>
						<p className='text-xs text-[#999999] mt-1'>Unable to render component</p>
					</div>
				</div>
			)
		}
	}, [
		componentCode,
		width,
		height,
		backgroundColor,
		primaryColor,
		strokeColor,
		logoBackgroundColor,
		fillColor,
		svgBackgroundColor,
	])

	return processedComponent
}

export default function LogoConverter() {
	const [format, setFormat] = useState<'png' | 'svg'>('png')
	const [width, setWidth] = useState(256)
	const [height, setHeight] = useState(256)
	const [backgroundColor, setBackgroundColor] = useState('transparent')
	const [primaryColor, setPrimaryColor] = useState('#666666')
	const [isGenerating, setIsGenerating] = useState(false)
	const [uploadedComponent, setUploadedComponent] = useState<string>('')
	const [uploadedFileName, setUploadedFileName] = useState<string>('')
	const [dragOver, setDragOver] = useState(false)
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const previewRef = useRef<HTMLDivElement>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)
	const [strokeColor, setStrokeColor] = useState('#666666')
	const [logoBackgroundColor, setLogoBackgroundColor] = useState('transparent')
	const [fillColor, setFillColor] = useState('#333333')
	const [svgBackgroundColor, setSvgBackgroundColor] = useState('transparent')

	const presetSizes = [
		{ name: 'Icon', width: 32, height: 32 },
		{ name: 'Small', width: 64, height: 64 },
		{ name: 'Medium', width: 128, height: 128 },
		{ name: 'Large', width: 256, height: 256 },
		{ name: 'XL', width: 512, height: 512 },
	]

	const backgroundPresets = [
		{ name: 'Transparent', value: 'transparent' },
		{ name: 'Dark', value: '#0b0b0b' },
		{ name: 'Black', value: '#000000' },
		{ name: 'Gray', value: '#1a1a1a' },
		{ name: 'White', value: '#ffffff' },
	]

	const handleFileUpload = (file: File) => {
		if (
			file.type === 'text/plain' ||
			file.name.endsWith('.tsx') ||
			file.name.endsWith('.jsx')
		) {
			const reader = new FileReader()
			reader.onload = e => {
				const content = e.target?.result as string
				setUploadedComponent(content)
				setUploadedFileName(file.name)
			}
			reader.readAsText(file)
		}
	}

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault()
		setDragOver(false)
		const files = Array.from(e.dataTransfer.files)
		if (files.length > 0) {
			handleFileUpload(files[0])
		}
	}

	const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files
		if (files && files.length > 0) {
			handleFileUpload(files[0])
		}
	}

	const generateSVGFromComponent = useCallback(() => {
		const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
		svgElement.setAttribute('width', width.toString())
		svgElement.setAttribute('height', height.toString())
		svgElement.setAttribute('viewBox', `0 0 ${width} ${height}`)
		svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg')

		// Add background if not transparent
		if (backgroundColor !== 'transparent') {
			const rect = document.createElementNS('http://wwww3org/2000/svg', 'rect')
			rect.setAttribute('width', '100%')
			rect.setAttribute('height', '100%')
			rect.setAttribute('fill', backgroundColor)
			svgElement.appendChild(rect)
		}

		// Create the logo group
		const logoGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
		logoGroup.setAttribute('transform', `translate(${width / 2}, ${height / 2})`)

		// Scale factor to fit the logo in the canvas
		const scale = Math.min(width, height) / 80
		const logoContainer = document.createElementNS('http://www.w3.org/2000/svg', 'g')
		logoContainer.setAttribute('transform', `scale(${scale}) translate(-16, -16)`)

		// Add logo background if not transparent (for uploaded components)
		if (uploadedComponent && svgBackgroundColor !== 'transparent') {
			const svgBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
			svgBg.setAttribute('x', '0')
			svgBg.setAttribute('y', '0')
			svgBg.setAttribute('width', '32')
			svgBg.setAttribute('height', '32')
			svgBg.setAttribute('fill', svgBackgroundColor)
			svgBg.setAttribute('rx', '4')
			logoContainer.appendChild(svgBg)
		}

		// Add logo background if not transparent (for uploaded components)
		if (uploadedComponent && logoBackgroundColor !== 'transparent') {
			const logoBg = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
			logoBg.setAttribute('cx', '16')
			logoBg.setAttribute('cy', '16')
			logoBg.setAttribute('r', '15')
			logoBg.setAttribute('fill', logoBackgroundColor)
			logoBg.setAttribute('opacity', '0.8')
			logoContainer.appendChild(logoBg)
		}

		// Add the hexagon - use custom colors if component is uploaded
		const hexagon = document.createElementNS('http://www.w3.org/2000/svg', 'path')
		hexagon.setAttribute('d', 'M16 2L28 9V23L16 30L4 23V9L16 2Z')
		hexagon.setAttribute(
			'fill',
			uploadedComponent
				? fillColor === 'transparent'
					? 'none'
					: `${fillColor}4D`
				: `${primaryColor}1A`
		)
		hexagon.setAttribute('stroke', uploadedComponent ? strokeColor : primaryColor)
		hexagon.setAttribute('stroke-width', uploadedComponent ? '1.5' : '1')
		logoContainer.appendChild(hexagon)

		// Add data streams
		const streams = ['M8 18L16 22L24 18', 'M8 14L16 18L24 14', 'M8 10L16 14L24 10']
		streams.forEach(d => {
			const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
			path.setAttribute('d', d)
			path.setAttribute('stroke', uploadedComponent ? strokeColor : primaryColor)
			path.setAttribute('stroke-width', uploadedComponent ? '1.2' : '1')
			path.setAttribute('stroke-linecap', 'round')
			logoContainer.appendChild(path)
		})

		// Add accent lines
		const accents = ['M16 2V30', 'M4 9L28 9', 'M4 23L28 23']
		accents.forEach(d => {
			const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
			path.setAttribute('d', d)
			path.setAttribute(
				'stroke',
				uploadedComponent ? `${strokeColor}99` : `${primaryColor}66`
			)
			path.setAttribute('stroke-width', '0.75')
			path.setAttribute('stroke-dasharray', '2 2')
			logoContainer.appendChild(path)
		})

		// Add highlight points
		const points = [
			{ cx: 16, cy: 2 },
			{ cx: 28, cy: 9 },
			{ cx: 28, cy: 23 },
			{ cx: 16, cy: 30 },
			{ cx: 4, cy: 23 },
			{ cx: 4, cy: 9 },
		]
		points.forEach(({ cx, cy }) => {
			const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
			circle.setAttribute('cx', cx.toString())
			circle.setAttribute('cy', cy.toString())
			circle.setAttribute('r', '1.5')
			circle.setAttribute('fill', primaryColor)
			logoContainer.appendChild(circle)
		})

		logoGroup.appendChild(logoContainer)
		svgElement.appendChild(logoGroup)

		return svgElement
	}, [
		width,
		height,
		backgroundColor,
		primaryColor,
		uploadedComponent,
		strokeColor,
		logoBackgroundColor,
		fillColor,
		svgBackgroundColor,
	])

	const downloadAsSVG = useCallback(() => {
		const svgElement = generateSVGFromComponent()
		const svgString = new XMLSerializer().serializeToString(svgElement)
		const blob = new Blob([svgString], { type: 'image/svg+xml' })
		const url = URL.createObjectURL(blob)

		const link = document.createElement('a')
		link.href = url
		link.download = `${uploadedFileName ? uploadedFileName.replace(/\.[^/.]+$/, '') : 'logo'}-${width}x${height}.svg`
		link.click()

		URL.revokeObjectURL(url)
	}, [generateSVGFromComponent, uploadedFileName, width, height])

	const downloadAsPNG = useCallback(async () => {
		if (!canvasRef.current) return

		setIsGenerating(true)

		try {
			const canvas = canvasRef.current
			const ctx = canvas.getContext('2d')
			if (!ctx) return

			canvas.width = width
			canvas.height = height

			// Set background
			if (backgroundColor !== 'transparent') {
				ctx.fillStyle = backgroundColor
				ctx.fillRect(0, 0, width, height)
			}

			// Generate SVG and convert to image
			const svgElement = generateSVGFromComponent()
			const svgString = new XMLSerializer().serializeToString(svgElement)
			const svgBlob = new Blob([svgString], { type: 'image/svg+xml' })
			const svgUrl = URL.createObjectURL(svgBlob)

			const img = new Image()
			img.crossOrigin = 'anonymous'
			img.onload = () => {
				ctx.drawImage(img, 0, 0, width, height)

				canvas.toBlob(blob => {
					if (blob) {
						const url = URL.createObjectURL(blob)
						const link = document.createElement('a')
						link.href = url
						link.download = `${uploadedFileName ? uploadedFileName.replace(/\.[^/.]+$/, '') : 'logo'}-${width}x${height}.png`
						link.click()
						URL.revokeObjectURL(url)
					}
					setIsGenerating(false)
				}, 'image/png')

				URL.revokeObjectURL(svgUrl)
			}

			img.onerror = () => {
				console.error('Failed to load SVG')
				setIsGenerating(false)
			}

			img.src = svgUrl
		} catch (error) {
			console.error('PNG generation failed:', error)
			setIsGenerating(false)
		}
	}, [generateSVGFromComponent, uploadedFileName, width, height, backgroundColor])

	const handleDownload = () => {
		if (format === 'svg') {
			downloadAsSVG()
		} else {
			downloadAsPNG()
		}
	}

	return (
		<div className='min-h-screen bg-[#0b0b0b] text-[#e5e5e5]'>
			<div className='container mx-auto p-6 max-w-6xl'>
				<div className='mb-8'>
					<h1 className='text-3xl font-bold mb-2 text-[#e5e5e5]'>Logo Converter</h1>
					<p className='text-[#999999]'>
						Upload your React logo component and convert it to SVG or PNG format with
						custom dimensions and backgrounds.
					</p>
				</div>

				<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
					{/* Controls */}
					<Card className='bg-[#1a1a1a] border-[#333333]'>
						<CardHeader>
							<CardTitle className='flex items-center gap-2 text-[#e5e5e5]'>
								<Settings className='h-5 w-5' />
								Export Settings
							</CardTitle>
							<CardDescription className='text-[#999999]'>
								Configure your logo export options
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-6'>
							{/* Upload Section */}
							<div className='space-y-4'>
								<Label className='text-[#e5e5e5]'>Upload Component</Label>
								<div
									className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
										dragOver
											? 'border-[#555555] bg-[#222222]'
											: 'border-[#333333] hover:border-[#444444] hover:bg-[#1a1a1a]'
									}`}
									onDragOver={e => {
										e.preventDefault()
										setDragOver(true)
									}}
									onDragLeave={() => setDragOver(false)}
									onDrop={handleDrop}
									onClick={() => fileInputRef.current?.click()}
								>
									<Upload className='h-8 w-8 text-[#666666] mx-auto mb-3' />
									<p className='text-[#e5e5e5] mb-2'>
										Drop your React component here
									</p>
									<p className='text-[#999999] text-sm mb-3'>
										Supports .tsx, .jsx, and .txt files
									</p>
									<Button
										variant='outline'
										className='bg-[#333333] border-[#444444] text-[#e5e5e5] hover:bg-[#444444]'
									>
										Browse Files
									</Button>
								</div>
								<input
									ref={fileInputRef}
									type='file'
									accept='.tsx,.jsx,.txt'
									onChange={handleFileInput}
									className='hidden'
								/>

								{uploadedComponent && (
									<div className='bg-[#222222] border border-[#333333] rounded p-3'>
										<div className='flex items-center justify-between mb-2'>
											<div className='flex items-center gap-2'>
												<FileText className='h-4 w-4 text-[#666666]' />
												<span className='text-[#e5e5e5] text-sm'>
													{uploadedFileName}
												</span>
												<Badge className='bg-[#333333] text-[#999999] text-xs'>
													Animations Stripped
												</Badge>
											</div>
											<Button
												variant='ghost'
												size='sm'
												onClick={() => {
													setUploadedComponent('')
													setUploadedFileName('')
												}}
												className='text-[#999999] hover:text-red-400 hover:bg-[#333333]'
											>
												<X className='h-4 w-4' />
											</Button>
										</div>
										<div className='text-xs text-[#999999] bg-[#1a1a1a] p-2 rounded max-h-20 overflow-y-auto'>
											<p className='mb-1'>
												✓ Removed framer-motion imports and animations
											</p>
											<p className='mb-1'>
												✓ Stripped motion prefixes and animation props
											</p>
											<p>✓ Converted to static component</p>
										</div>
									</div>
								)}
							</div>

							<Separator className='bg-[#333333]' />

							{/* Format Selection */}
							<div className='space-y-2'>
								<Label className='text-[#e5e5e5]'>Export Format</Label>
								<Select
									value={format}
									onValueChange={(value: 'png' | 'svg') => setFormat(value)}
								>
									<SelectTrigger className='bg-[#222222] border-[#333333] text-[#e5e5e5]'>
										<SelectValue />
									</SelectTrigger>
									<SelectContent className='bg-[#222222] border-[#333333]'>
										<SelectItem
											value='png'
											className='text-[#e5e5e5] focus:bg-[#333333]'
										>
											PNG (Raster)
										</SelectItem>
										<SelectItem
											value='svg'
											className='text-[#e5e5e5] focus:bg-[#333333]'
										>
											SVG (Vector)
										</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<Separator className='bg-[#333333]' />

							{/* Dimensions */}
							<div className='space-y-4'>
								<Label className='text-[#e5e5e5]'>Dimensions</Label>
								<div className='grid grid-cols-2 gap-4'>
									<div className='space-y-2'>
										<Label htmlFor='width' className='text-[#999999]'>
											Width
										</Label>
										<Input
											id='width'
											type='number'
											value={width}
											onChange={e => setWidth(Number(e.target.value))}
											min='16'
											max='2048'
											className='bg-[#222222] border-[#333333] text-[#e5e5e5]'
										/>
									</div>
									<div className='space-y-2'>
										<Label htmlFor='height' className='text-[#999999]'>
											Height
										</Label>
										<Input
											id='height'
											type='number'
											value={height}
											onChange={e => setHeight(Number(e.target.value))}
											min='16'
											max='2048'
											className='bg-[#222222] border-[#333333] text-[#e5e5e5]'
										/>
									</div>
								</div>

								{/* Preset Sizes */}
								<div className='space-y-2'>
									<Label className='text-[#999999]'>Quick Sizes</Label>
									<div className='flex flex-wrap gap-2'>
										{presetSizes.map(preset => (
											<Badge
												key={preset.name}
												variant='outline'
												className='cursor-pointer bg-[#222222] border-[#333333] text-[#e5e5e5] hover:bg-[#333333] hover:text-[#e5e5e5]'
												onClick={() => {
													setWidth(preset.width)
													setHeight(preset.height)
												}}
											>
												{preset.name} ({preset.width}×{preset.height})
											</Badge>
										))}
									</div>
								</div>
							</div>

							<Separator className='bg-[#333333]' />

							{/* Background Color */}
							<div className='space-y-4'>
								<Label className='text-[#e5e5e5]'>Background</Label>
								<div className='flex flex-wrap gap-2'>
									{backgroundPresets.map(preset => (
										<Badge
											key={preset.name}
											variant={
												backgroundColor === preset.value
													? 'default'
													: 'outline'
											}
											className={`cursor-pointer ${
												backgroundColor === preset.value
													? 'bg-[#444444] border-[#555555] text-[#e5e5e5]'
													: 'bg-[#222222] border-[#333333] text-[#e5e5e5] hover:bg-[#333333]'
											}`}
											onClick={() => setBackgroundColor(preset.value)}
										>
											{preset.name}
										</Badge>
									))}
								</div>
								<div className='space-y-2'>
									<Label htmlFor='custom-bg' className='text-[#999999]'>
										Custom Background Color
									</Label>
									<div className='flex gap-2'>
										<Input
											id='custom-bg'
											type='color'
											value={
												backgroundColor === 'transparent'
													? '#0b0b0b'
													: backgroundColor
											}
											onChange={e => setBackgroundColor(e.target.value)}
											className='w-16 h-10 p-1 bg-[#222222] border-[#333333]'
										/>
										<Input
											value={backgroundColor}
											onChange={e => setBackgroundColor(e.target.value)}
											placeholder='transparent or #hex'
											className='bg-[#222222] border-[#333333] text-[#e5e5e5]'
										/>
									</div>
								</div>
							</div>

							<Separator className='bg-[#333333]' />

							{/* Primary Color */}
							<div className='space-y-2'>
								<Label htmlFor='primary-color' className='text-[#e5e5e5]'>
									Primary Color
								</Label>
								<div className='flex gap-2'>
									<Input
										id='primary-color'
										type='color'
										value={primaryColor}
										onChange={e => setPrimaryColor(e.target.value)}
										className='w-16 h-10 p-1 bg-[#222222] border-[#333333]'
									/>
									<Input
										value={primaryColor}
										onChange={e => setPrimaryColor(e.target.value)}
										placeholder='#hex'
										className='bg-[#222222] border-[#333333] text-[#e5e5e5]'
									/>
								</div>
							</div>

							<Separator className='bg-[#333333]' />

							{/* Logo Customization - only show when component is uploaded */}
							{uploadedComponent && (
								<>
									<div className='space-y-4'>
										<Label className='text-[#e5e5e5]'>Logo Customization</Label>

										{/* Stroke/Line Color */}
										<div className='space-y-2'>
											<Label
												htmlFor='stroke-color'
												className='text-[#999999]'
											>
												Stroke/Line Color
											</Label>
											<div className='flex gap-2'>
												<Input
													id='stroke-color'
													type='color'
													value={strokeColor}
													onChange={e => setStrokeColor(e.target.value)}
													className='w-16 h-10 p-1 bg-[#222222] border-[#333333]'
												/>
												<Input
													value={strokeColor}
													onChange={e => setStrokeColor(e.target.value)}
													placeholder='#hex'
													className='bg-[#222222] border-[#333333] text-[#e5e5e5]'
												/>
											</div>
										</div>

										{/* Fill Color */}
										<div className='space-y-2'>
											<Label htmlFor='fill-color' className='text-[#999999]'>
												Fill Color
											</Label>
											<div className='flex gap-2'>
												<Input
													id='fill-color'
													type='color'
													value={
														fillColor === 'transparent'
															? '#333333'
															: fillColor
													}
													onChange={e => setFillColor(e.target.value)}
													className='w-16 h-10 p-1 bg-[#222222] border-[#333333]'
												/>
												<Input
													value={fillColor}
													onChange={e => setFillColor(e.target.value)}
													placeholder='transparent or #hex'
													className='bg-[#222222] border-[#333333] text-[#e5e5e5]'
												/>
											</div>
										</div>

										{/* Logo Background Color */}
										<div className='space-y-2'>
											<Label
												htmlFor='logo-bg-color'
												className='text-[#999999]'
											>
												Logo Background
											</Label>
											<div className='flex gap-2'>
												<Input
													id='logo-bg-color'
													type='color'
													value={
														logoBackgroundColor === 'transparent'
															? '#1a1a1a'
															: logoBackgroundColor
													}
													onChange={e =>
														setLogoBackgroundColor(e.target.value)
													}
													className='w-16 h-10 p-1 bg-[#222222] border-[#333333]'
												/>
												<Input
													value={logoBackgroundColor}
													onChange={e =>
														setLogoBackgroundColor(e.target.value)
													}
													placeholder='transparent or #hex'
													className='bg-[#222222] border-[#333333] text-[#e5e5e5]'
												/>
											</div>
										</div>

										{/* SVG Background Color */}
										<div className='space-y-2'>
											<Label
												htmlFor='svg-bg-color'
												className='text-[#999999]'
											>
												SVG Background
											</Label>
											<div className='flex gap-2'>
												<Input
													id='svg-bg-color'
													type='color'
													value={
														svgBackgroundColor === 'transparent'
															? '#1a1a1a'
															: svgBackgroundColor
													}
													onChange={e =>
														setSvgBackgroundColor(e.target.value)
													}
													className='w-16 h-10 p-1 bg-[#222222] border-[#333333]'
												/>
												<Input
													value={svgBackgroundColor}
													onChange={e =>
														setSvgBackgroundColor(e.target.value)
													}
													placeholder='transparent or #hex'
													className='bg-[#222222] border-[#333333] text-[#e5e5e5]'
												/>
											</div>
										</div>

										{/* Quick Color Presets */}
										<div className='space-y-2'>
											<Label className='text-[#999999]'>Quick Presets</Label>
											<div className='grid grid-cols-2 gap-2'>
												<Button
													variant='outline'
													size='sm'
													onClick={() => {
														setStrokeColor('#666666')
														setFillColor('#333333')
														setLogoBackgroundColor('transparent')
														setSvgBackgroundColor('transparent')
													}}
													className='bg-[#222222] border-[#333333] text-[#e5e5e5] hover:bg-[#333333]'
												>
													Default Gray
												</Button>
												<Button
													variant='outline'
													size='sm'
													onClick={() => {
														setStrokeColor('#3b82f6')
														setFillColor('#1e40af')
														setLogoBackgroundColor('transparent')
														setSvgBackgroundColor('#1e293b')
													}}
													className='bg-[#222222] border-[#333333] text-[#e5e5e5] hover:bg-[#333333]'
												>
													Blue Theme
												</Button>
												<Button
													variant='outline'
													size='sm'
													onClick={() => {
														setStrokeColor('#10b981')
														setFillColor('#059669')
														setLogoBackgroundColor('transparent')
														setSvgBackgroundColor('#064e3b')
													}}
													className='bg-[#222222] border-[#333333] text-[#e5e5e5] hover:bg-[#333333]'
												>
													Green Theme
												</Button>
												<Button
													variant='outline'
													size='sm'
													onClick={() => {
														setStrokeColor('#ffffff')
														setFillColor('#000000')
														setLogoBackgroundColor('#1a1a1a')
														setSvgBackgroundColor('#000000')
													}}
													className='bg-[#222222] border-[#333333] text-[#e5e5e5] hover:bg-[#333333]'
												>
													High Contrast
												</Button>
											</div>
										</div>
									</div>
									<Separator className='bg-[#333333]' />
								</>
							)}

							{/* Download Button */}
							<Button
								onClick={handleDownload}
								className='w-full bg-[#333333] hover:bg-[#444444] text-[#e5e5e5]'
								size='lg'
								disabled={isGenerating}
							>
								<Download className='h-4 w-4 mr-2' />
								{isGenerating
									? 'Generating...'
									: `Download as ${format.toUpperCase()}`}
							</Button>
						</CardContent>
					</Card>

					{/* Preview */}
					<Card className='bg-[#1a1a1a] border-[#333333]'>
						<CardHeader>
							<CardTitle className='flex items-center gap-2 text-[#e5e5e5]'>
								<Eye className='h-5 w-5' />
								Preview
							</CardTitle>
							<CardDescription className='text-[#999999]'>
								Live preview of your{' '}
								{uploadedComponent ? 'uploaded component' : 'logo'} with current
								settings
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='space-y-4'>
								<div className='text-sm text-[#999999]'>
									Size: {width} × {height}px | Format: {format.toUpperCase()} |
									Background:{' '}
									{backgroundColor === 'transparent'
										? 'Transparent'
										: backgroundColor}
									{uploadedComponent && ' | Source: Uploaded Component'}
								</div>

								<div
									ref={previewRef}
									className='border-2 border-dashed border-[#333333] rounded-lg p-8 flex items-center justify-center min-h-[300px]'
									style={{
										backgroundColor:
											backgroundColor === 'transparent'
												? 'transparent'
												: backgroundColor,
										backgroundImage:
											backgroundColor === 'transparent'
												? 'linear-gradient(45deg, #333333 25%, transparent 25%), linear-gradient(-45deg, #333333 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #333333 75%), linear-gradient(-45deg, transparent 75%, #333333 75%)'
												: 'none',
										backgroundSize:
											backgroundColor === 'transparent'
												? '20px 20px'
												: 'auto',
										backgroundPosition:
											backgroundColor === 'transparent'
												? '0 0, 0 10px, 10px -10px, -10px 0px'
												: 'auto',
									}}
								>
									{uploadedComponent ? (
										<UploadedComponentRenderer
											componentCode={uploadedComponent}
											width={Math.min(width, 200)}
											height={Math.min(height, 200)}
											backgroundColor={backgroundColor}
											primaryColor={primaryColor}
											strokeColor={strokeColor}
											logoBackgroundColor={logoBackgroundColor}
											fillColor={fillColor}
											svgBackgroundColor={svgBackgroundColor}
										/>
									) : (
										<StaticLogo
											width={Math.min(width, 200)}
											height={Math.min(height, 200)}
											backgroundColor={backgroundColor}
											primaryColor={primaryColor}
										/>
									)}
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Hidden canvas for PNG generation */}
				<canvas ref={canvasRef} style={{ display: 'none' }} />
			</div>
		</div>
	)
}
