import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { registerUser, markUserSetupComplete } from '@/services/user-service'
import type { TCreateUserData } from '@/types'
import { CheckCircle, User, Rocket, ArrowRight, ArrowLeft, FolderOpen } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'

interface OnboardingStep {
    id: number
    title: string
    description: string
    icon: React.ComponentType<{ className?: string }>
}

const ONBOARDING_STEPS: OnboardingStep[] = [
    {
        id: 1,
        title: 'Welcome to Ryoe',
        description: 'Your personal note-taking workspace designed for developers and creators.',
        icon: Rocket,
    },
    {
        id: 2,
        title: 'Setup Your Profile',
        description: 'Let\'s create your workspace profile.',
        icon: User,
    },
    {
        id: 3,
        title: 'You\'re All Set!',
        description: 'Your workspace is ready. Let\'s start creating amazing notes.',
        icon: CheckCircle,
    },
]

export function OnboardingFlow() {
    const [currentStep, setCurrentStep] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        snippetsPath: `${process.env.HOME || '~'}/.config/ryoe`,
    })
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const handleNext = async () => {
        if (currentStep === 2) {
            // Validate form data
            if (!formData.name.trim()) {
                alert('Please enter your name')
                return
            }

            // Create user in database
            setIsLoading(true)
            try {
                const userData: TCreateUserData = {
                    name: formData.name.trim(),
                    snippetsPath: formData.snippetsPath || `${process.env.HOME || '~'}/.config/ryoe`,
                    storageType: 'local', // Default to local for this local application
                    preferences: {
                        theme: 'system',
                        sidebarCollapsed: false,
                        autoSave: true,
                        showLineNumbers: true,
                        fontSize: 14,
                        editorTheme: 'default',
                    },
                }

                const result = await registerUser(userData)
                if (!result.success) {
                    throw new Error(result.error || 'Failed to create user')
                }

                // Mark setup as complete
                await markUserSetupComplete(result.data!.id)
                setCurrentStep(3)
            } catch (error) {
                console.error('Failed to create user:', error)
                alert('Failed to create user profile. Please try again.')
            } finally {
                setIsLoading(false)
            }
        } else if (currentStep === 3) {
            await handleCompleteOnboarding()
        } else {
            setCurrentStep(currentStep + 1)
        }
    }

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
        }
    }

    const handleCompleteOnboarding = async () => {
        setIsLoading(true)
        try {
            queryClient.invalidateQueries({ queryKey: ['user', 'current'] })
            navigate('/notes')
        } catch (error) {
            console.error('Failed to complete onboarding:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const currentStepData = ONBOARDING_STEPS.find(step => step.id === currentStep)

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="text-center space-y-8">
                        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-background via-card/80 to-muted/20 backdrop-blur-sm flex items-center justify-center border border-border/30 shadow-lg">
                            <Rocket className="w-10 h-10 text-foreground/80" />
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                                Welcome to Ryoe
                            </h2>
                            <p className="text-muted-foreground/80 text-lg max-w-md mx-auto leading-relaxed">
                                Your personal note-taking workspace designed for developers and creators.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                            <div className="p-6 rounded-xl bg-gradient-to-br from-card/60 via-card/80 to-background/95 backdrop-blur-sm border border-border/30 shadow-sm hover:shadow-md transition-all duration-200">
                                <h3 className="font-semibold mb-3 text-foreground/90 flex items-center gap-2">
                                    📝 Smart Notes
                                </h3>
                                <p className="text-muted-foreground/70 text-sm leading-relaxed">
                                    Organize thoughts with folders and tags
                                </p>
                            </div>
                            <div className="p-6 rounded-xl bg-gradient-to-br from-card/60 via-card/80 to-background/95 backdrop-blur-sm border border-border/30 shadow-sm hover:shadow-md transition-all duration-200">
                                <h3 className="font-semibold mb-3 text-foreground/90 flex items-center gap-2">
                                    🚀 Fast & Local
                                </h3>
                                <p className="text-muted-foreground/70 text-sm leading-relaxed">
                                    Lightning-fast local storage
                                </p>
                            </div>
                            <div className="p-6 rounded-xl bg-gradient-to-br from-card/60 via-card/80 to-background/95 backdrop-blur-sm border border-border/30 shadow-sm hover:shadow-md transition-all duration-200">
                                <h3 className="font-semibold mb-3 text-foreground/90 flex items-center gap-2">
                                    🎨 Beautiful UI
                                </h3>
                                <p className="text-muted-foreground/70 text-sm leading-relaxed">
                                    Modern, distraction-free interface
                                </p>
                            </div>
                        </div>
                    </div>
                )

            case 2:
                return (
                    <div className="space-y-8">
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-background via-card/80 to-muted/20 backdrop-blur-sm flex items-center justify-center border border-border/30 shadow-lg">
                                <User className="w-8 h-8 text-foreground/80" />
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                                Setup Your Profile
                            </h2>
                            <p className="text-muted-foreground/80 leading-relaxed">
                                Tell us your name to personalize your workspace.
                            </p>
                        </div>
                        <div className="space-y-6 max-w-md mx-auto">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-foreground/90 font-medium">
                                    Your Name
                                </Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Enter your name"
                                    className="h-12 bg-card/50 border-border/40 focus:border-border/80 focus:bg-card/80 transition-all duration-200 rounded-lg"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="snippetsPath" className="text-foreground/90 font-medium">
                                    Storage Path
                                </Label>
                                <div className="relative">
                                    <FolderOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                                    <Input
                                        id="snippetsPath"
                                        value={formData.snippetsPath}
                                        onChange={(e) => setFormData(prev => ({ ...prev, snippetsPath: e.target.value }))}
                                        placeholder="~/.config/ryoe"
                                        className="h-12 pl-10 bg-card/50 border-border/40 focus:border-border/80 focus:bg-card/80 transition-all duration-200 rounded-lg font-mono text-sm"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground/60 leading-relaxed">
                                    This is where your notes and configuration will be stored locally.
                                </p>
                            </div>
                        </div>
                    </div>
                )

            case 3:
                return (
                    <div className="text-center space-y-8">
                        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-background via-card/80 to-muted/20 backdrop-blur-sm flex items-center justify-center border border-border/30 shadow-lg">
                            <CheckCircle className="w-10 h-10 text-green-500" />
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                                You're All Set!
                            </h2>
                            <p className="text-muted-foreground/80 text-lg max-w-md mx-auto leading-relaxed">
                                Your workspace is ready. Let's start creating amazing notes.
                            </p>
                        </div>
                        <div className="p-6 rounded-xl bg-gradient-to-br from-card/60 via-card/80 to-background/95 backdrop-blur-sm border border-border/30 shadow-sm max-w-md mx-auto">
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground/80">Name:</span>
                                    <span className="font-medium text-foreground/90">{formData.name}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground/80">Storage:</span>
                                    <span className="font-mono text-xs text-foreground/80">{formData.snippetsPath}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground/80">Type:</span>
                                    <span className="text-foreground/90">Local Application</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )

            default:
                return null
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background via-background/98 to-muted/5">
            <Card className="w-full max-w-3xl border-border/40 bg-gradient-to-br from-card/80 via-card/90 to-background/95 backdrop-blur-sm shadow-xl">
                <CardHeader className="text-center pb-8 pt-8">
                    {/* Progress Steps */}
                    <div className="flex items-center justify-center space-x-3 mb-8">
                        {ONBOARDING_STEPS.map((step, index) => (
                            <div key={step.id} className="flex items-center">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${step.id <= currentStep
                                        ? 'bg-gradient-to-br from-foreground/90 to-foreground/70 text-background shadow-lg'
                                        : 'bg-muted/40 text-muted-foreground/60 border border-border/30'
                                        }`}
                                >
                                    {step.id < currentStep ? (
                                        <CheckCircle className="w-5 h-5" />
                                    ) : (
                                        step.id
                                    )}
                                </div>
                                {index < ONBOARDING_STEPS.length - 1 && (
                                    <div
                                        className={`w-16 h-0.5 mx-3 transition-all duration-300 ${step.id < currentStep
                                            ? 'bg-gradient-to-r from-foreground/80 to-foreground/60'
                                            : 'bg-border/40'
                                            }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Step Title */}
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground/90">
                            {currentStepData?.title}
                        </h1>
                        <p className="text-muted-foreground/70 leading-relaxed">
                            {currentStepData?.description}
                        </p>
                    </div>
                </CardHeader>

                <CardContent className="pb-8">
                    <div className="mb-12">
                        {renderStepContent()}
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between items-center pt-6 border-t border-border/30">
                        <Button
                            variant="ghost"
                            onClick={handleBack}
                            disabled={currentStep === 1 || isLoading}
                            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </Button>

                        <Button
                            onClick={handleNext}
                            disabled={isLoading}
                            className="flex items-center gap-2 bg-gradient-to-r from-foreground/90 to-foreground/70 text-background hover:from-foreground hover:to-foreground/80 shadow-lg hover:shadow-xl transition-all duration-200 px-8"
                        >
                            {isLoading ? (
                                'Setting up...'
                            ) : (
                                <>
                                    {currentStep === 3 ? 'Enter Workspace' : 'Continue'}
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 