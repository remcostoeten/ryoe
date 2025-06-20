import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/shared/utils'
import { Link } from 'react-router'

interface SignInPageProps {
	className?: string
}

// Simple animated background component
const AnimatedBackground = ({ reverse = false }: { reverse?: boolean }) => {
	const animationDirection = reverse ? 'reverse' : 'normal'

	return (
		<div className='absolute inset-0 overflow-hidden'>
			<div className='absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800' />
			<div className='absolute inset-0'>
				{Array.from({ length: 50 }).map((_, i) => {
					const hue = ((i * 5 + 120) % 160) + 120 // Green to grey range (120-160)
					const color = `hsl(${hue}, 30%, 45%)`
					return (
						<motion.div
							key={i}
							className='absolute w-1 h-1 rounded-full opacity-20'
							style={{
								left: `${Math.random() * 100}%`,
								top: `${Math.random() * 100}%`,
								animationDirection,
								backgroundColor: color,
							}}
							animate={{
								opacity: [0.1, 0.8, 0.1],
								scale: [0.5, 1.5, 0.5],
								backgroundColor: [
									color,
									`hsl(${((hue + 20) % 160) + 120}, 35%, 50%)`,
									color,
								],
							}}
							transition={{
								duration: 2 + Math.random() * 3,
								repeat: Infinity,
								delay: Math.random() * 2,
							}}
						/>
					)
				})}
			</div>
			<div className='absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-50' />
		</div>
	)
}

const SignInPage = ({ className }: SignInPageProps) => {
	const [email, setEmail] = useState('')
	const [step, setStep] = useState<'email' | 'code' | 'success'>('email')
	const [code, setCode] = useState(['', '', '', '', '', ''])
	const codeInputRefs = useRef<(HTMLInputElement | null)[]>([])
	const [reverseCanvasVisible, setReverseCanvasVisible] = useState(false)

	const handleEmailSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (email) {
			setStep('code')
		}
	}

	// Focus first input when code screen appears
	useEffect(() => {
		if (step === 'code') {
			setTimeout(() => {
				codeInputRefs.current[0]?.focus()
			}, 500)
		}
	}, [step])

	const handleCodeChange = (index: number, value: string) => {
		if (value.length <= 1) {
			const newCode = [...code]
			newCode[index] = value
			setCode(newCode)

			// Focus next input if value is entered
			if (value && index < 5) {
				codeInputRefs.current[index + 1]?.focus()
			}

			// Check if code is complete
			if (index === 5 && value) {
				const isComplete = newCode.every(digit => digit.length === 1)
				if (isComplete) {
					// Show the reverse animation
					setReverseCanvasVisible(true)

					// Transition to success screen after animation
					setTimeout(() => {
						setStep('success')
					}, 2000)
				}
			}
		}
	}

	const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Backspace' && !code[index] && index > 0) {
			codeInputRefs.current[index - 1]?.focus()
		}
	}

	const handleBackClick = () => {
		setStep('email')
		setCode(['', '', '', '', '', ''])
		// Reset animations if going back
		setReverseCanvasVisible(false)
	}

	return (
		<div className={cn('flex w-[100%] flex-col min-h-screen bg-black relative', className)}>
			<div className='absolute inset-0 z-0'>
				<AnimatedBackground reverse={reverseCanvasVisible} />
			</div>

			{/* Content Layer */}
			<div className='relative z-10 flex flex-col flex-1'>
				<div className='flex flex-1 flex-col lg:flex-row '>
					{/* Left side (form) */}
					<div className='flex-1 flex flex-col justify-center items-center'>
						<div className='w-full mt-[150px] max-w-sm'>
							<AnimatePresence mode='wait'>
								{step === 'email' ? (
									<motion.div
										key='email-step'
										initial={{ opacity: 0, x: -100 }}
										animate={{ opacity: 1, x: 0 }}
										exit={{ opacity: 0, x: -100 }}
										transition={{
											duration: 0.4,
											ease: 'easeOut',
										}}
										className='space-y-6 text-center'
									>
										<div className='space-y-1'>
											<h1 className='text-[2.5rem] font-bold leading-[1.1] tracking-tight text-white'>
												Welcome Developer
											</h1>
											<p className='text-[1.8rem] text-white/70 font-light'>
												Your sign in component
											</p>
										</div>

										<div className='space-y-4'>
											<button className='backdrop-blur-[2px] w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full py-3 px-4 transition-colors'>
												<span className='text-lg'>G</span>
												<span>Sign in with Google</span>
											</button>

											<div className='flex items-center gap-4'>
												<div className='h-px bg-white/10 flex-1' />
												<span className='text-white/40 text-sm'>or</span>
												<div className='h-px bg-white/10 flex-1' />
											</div>

											<form onSubmit={handleEmailSubmit}>
												<div className='relative'>
													<input
														type='email'
														placeholder='info@gmail.com'
														value={email}
														onChange={e => setEmail(e.target.value)}
														className='w-full backdrop-blur-[1px] text-white border-1 border-white/10 rounded-full py-3 px-4 focus:outline-none focus:border focus:border-white/30 text-center'
														required
													/>
													<button
														type='submit'
														className='absolute right-1.5 top-1.5 text-white w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors group overflow-hidden'
													>
														<span className='relative w-full h-full block overflow-hidden'>
															<span className='absolute inset-0 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-full'>
																→
															</span>
															<span className='absolute inset-0 flex items-center justify-center transition-transform duration-300 -translate-x-full group-hover:translate-x-0'>
																→
															</span>
														</span>
													</button>
												</div>
											</form>
										</div>

										<p className='text-xs text-white/40 pt-10'>
											By signing up, you agree to the{' '}
											<Link
												to='#'
												className='underline text-white/40 hover:text-white/60 transition-colors'
											>
												MSA
											</Link>
											,{' '}
											<Link
												to='#'
												className='underline text-white/40 hover:text-white/60 transition-colors'
											>
												Product Terms
											</Link>
											,{' '}
											<Link
												to='#'
												className='underline text-white/40 hover:text-white/60 transition-colors'
											>
												Policies
											</Link>
											,{' '}
											<Link
												to='#'
												className='underline text-white/40 hover:text-white/60 transition-colors'
											>
												Privacy Notice
											</Link>
											, and{' '}
											<Link
												to='#'
												className='underline text-white/40 hover:text-white/60 transition-colors'
											>
												Cookie Notice
											</Link>
											.
										</p>
									</motion.div>
								) : step === 'code' ? (
									<motion.div
										key='code-step'
										initial={{ opacity: 0, x: 100 }}
										animate={{ opacity: 1, x: 0 }}
										exit={{ opacity: 0, x: 100 }}
										transition={{
											duration: 0.4,
											ease: 'easeOut',
										}}
										className='space-y-6 text-center'
									>
										<div className='space-y-1'>
											<h1 className='text-[2.5rem] font-bold leading-[1.1] tracking-tight text-white'>
												We sent you a code
											</h1>
											<p className='text-[1.25rem] text-white/50 font-light'>
												Please enter it
											</p>
										</div>

										<div className='w-full'>
											<div className='relative rounded-full py-4 px-5 border border-white/10 bg-transparent'>
												<div className='flex items-center justify-center'>
													{code.map((digit, i) => (
														<div key={i} className='flex items-center'>
															<div className='relative'>
																<input
																	ref={el => {
																		codeInputRefs.current[i] =
																			el
																	}}
																	type='text'
																	inputMode='numeric'
																	pattern='[0-9]*'
																	maxLength={1}
																	value={digit}
																	onChange={e =>
																		handleCodeChange(
																			i,
																			e.target.value
																		)
																	}
																	onKeyDown={e =>
																		handleKeyDown(i, e)
																	}
																	className='w-8 text-center text-xl bg-transparent text-white border-none focus:outline-none focus:ring-0 appearance-none'
																	style={{
																		caretColor: 'transparent',
																	}}
																/>
																{!digit && (
																	<div className='absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none'>
																		<span className='text-xl text-white'>
																			0
																		</span>
																	</div>
																)}
															</div>
															{i < 5 && (
																<span className='text-white/20 text-xl'>
																	|
																</span>
															)}
														</div>
													))}
												</div>
											</div>
										</div>

										<div>
											<motion.p
												className='text-white/50 hover:text-white/70 transition-colors cursor-pointer text-sm'
												whileHover={{ scale: 1.02 }}
												transition={{ duration: 0.2 }}
											>
												Resend code
											</motion.p>
										</div>

										<div className='flex w-full gap-3'>
											<motion.button
												onClick={handleBackClick}
												className='rounded-full bg-white text-black font-medium px-8 py-3 hover:bg-white/90 transition-colors w-[30%]'
												whileHover={{ scale: 1.02 }}
												whileTap={{ scale: 0.98 }}
												transition={{ duration: 0.2 }}
											>
												Back
											</motion.button>
											<motion.button
												className={`flex-1 rounded-full font-medium py-3 border transition-all duration-300 ${
													code.every(d => d !== '')
														? 'bg-white text-black border-transparent hover:bg-white/90 cursor-pointer'
														: 'bg-[#111] text-white/50 border-white/10 cursor-not-allowed'
												}`}
												disabled={!code.every(d => d !== '')}
											>
												Continue
											</motion.button>
										</div>

										<div className='pt-16'>
											<p className='text-xs text-white/40'>
												By signing up, you agree to the{' '}
												<Link
													to='#'
													className='underline text-white/40 hover:text-white/60 transition-colors'
												>
													MSA
												</Link>
												,{' '}
												<Link
													to='#'
													className='underline text-white/40 hover:text-white/60 transition-colors'
												>
													Product Terms
												</Link>
												,{' '}
												<Link
													to='#'
													className='underline text-white/40 hover:text-white/60 transition-colors'
												>
													Policies
												</Link>
												,{' '}
												<Link
													to='#'
													className='underline text-white/40 hover:text-white/60 transition-colors'
												>
													Privacy Notice
												</Link>
												, and{' '}
												<Link
													to='#'
													className='underline text-white/40 hover:text-white/60 transition-colors'
												>
													Cookie Notice
												</Link>
												.
											</p>
										</div>
									</motion.div>
								) : (
									<motion.div
										key='success-step'
										initial={{ opacity: 0, y: 50 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{
											duration: 0.4,
											ease: 'easeOut',
											delay: 0.3,
										}}
										className='space-y-6 text-center'
									>
										<div className='space-y-1'>
											<h1 className='text-[2.5rem] font-bold leading-[1.1] tracking-tight text-white'>
												You&apos;re in!
											</h1>
											<p className='text-[1.25rem] text-white/50 font-light'>
												Welcome
											</p>
										</div>

										<motion.div
											initial={{ scale: 0.8, opacity: 0 }}
											animate={{ scale: 1, opacity: 1 }}
											transition={{
												duration: 0.5,
												delay: 0.5,
											}}
											className='py-10'
										>
											<div className='mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/25'>
												<motion.svg
													xmlns='http://www.w3.org/2000/svg'
													className='h-8 w-8 text-white'
													viewBox='0 0 20 20'
													fill='currentColor'
													initial={{ pathLength: 0 }}
													animate={{ pathLength: 1 }}
													transition={{
														duration: 0.8,
														delay: 0.7,
													}}
												>
													<path
														fillRule='evenodd'
														d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
														clipRule='evenodd'
													/>
												</motion.svg>
											</div>
										</motion.div>

										<motion.button
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											transition={{ delay: 1 }}
											className='w-full rounded-full bg-gradient-to-r from-emerald-500 to-slate-600 text-white font-medium py-3 hover:from-emerald-600 hover:to-slate-700 transition-all duration-300 shadow-lg shadow-emerald-500/25'
										>
											Continue to Dashboard
										</motion.button>
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export { SignInPage }
export default SignInPage
