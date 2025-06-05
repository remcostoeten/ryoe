import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utilities'

type TProps = {
    children: ReactNode
    absolute?: boolean
    flex?: boolean
    grid?: boolean
    fullscreen?: boolean
    className?: string
} & HTMLAttributes<HTMLDivElement>

export function Center({
    children,
    absolute = false,
    flex = true,
    grid = false,
    fullscreen = false,
    className,
    ...rest
}: TProps) {
    const base = flex ? 'flex justify-center items-center' : ''
    const gridCenter = grid ? 'grid place-items-center' : ''
    const layout = fullscreen ? 'w-screen h-screen' : ''
    const position = absolute ? 'absolute inset-0' : ''

    return (
        <div
            className={cn(base, gridCenter, layout, position, className)}
            {...rest}
        >
            {children}
        </div>
    )
}

/*
 * usage example:
 *	<Center fullscreen grid>
 *			<Spinner className="w-8 h-8 text-muted-foreground" />
 *		</Center>
 */
