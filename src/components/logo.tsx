import { motion } from 'framer-motion'
import { Link } from 'react-router'

const LogoIcon = () => {
    return (
        <motion.img
            src="/logo.png"
            alt="ryoe logo"
            className="h-8 w-8 transition-all duration-300 group-hover:scale-110 object-contain"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
                duration: 0.3,
                ease: [0.76, 0, 0.24, 1]
            }}
        />
    )
}

export function Logo() {
    return (
        <div className="flex items-center justify-center py-4  scale-75">
            <Link to="/">
                <motion.div
                    className="group relative flex h-14 w-14 items-center justify-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                        duration: 0.3,
                        ease: [0.76, 0, 0.24, 1],
                        delay: 0.2
                    }}
                >
                    {/* Animated background gradient */}
                    <motion.div
                        className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/20 via-primary/15 to-primary/10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.9 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    />

                    {/* Glowing effect */}
                    <motion.div
                        className="absolute inset-0 rounded-xl bg-primary/5 blur-xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                    />

                    {/* Main icon container */}
                    <motion.div
                        className="relative flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm shadow-lg border border-primary/20"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                    >
                        <LogoIcon />
                    </motion.div>

                    {/* Tooltip */}
                    <motion.span
                        className="absolute left-full ml-3 hidden rounded-md bg-popover/90 backdrop-blur-sm px-3 py-1.5 text-sm font-medium text-popover-foreground shadow-lg group-hover:block border border-border/50"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6, duration: 0.3 }}
                    >
                        ryoe
                    </motion.span>
                </motion.div>
            </Link>
        </div>
    )
}
