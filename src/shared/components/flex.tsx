import React, { type JSX, type ReactNode } from 'react'

type FlexProps = {
    children: ReactNode
    row?: boolean
    column?: boolean
    center?: boolean
    between?: boolean
    around?: boolean
    evenly?: boolean
    start?: boolean
    end?: boolean
    top?: boolean
    middle?: boolean
    bottom?: boolean
    wrap?: boolean
    nowrap?: boolean
    reverse?: boolean
    grow?: boolean
    shrink?: boolean
    gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    className?: string
    style?: React.CSSProperties
    onClick?: () => void
    as?: keyof JSX.IntrinsicElements
}

function Flex({
    children,
    row,
    column,
    center,
    between,
    around,
    evenly,
    start,
    end,
    top,
    middle,
    bottom,
    wrap,
    nowrap,
    reverse,
    grow,
    shrink,
    gap,
    className = '',
    style,
    onClick,
    as: Component = 'div',
    ...rest
}: FlexProps) {
    const classes = ['flex']

    // Direction
    if (row || !column) {
        classes.push(reverse ? 'flex-row-reverse' : 'flex-row')
    }
    if (column) {
        classes.push(reverse ? 'flex-col-reverse' : 'flex-col')
    }

    // Justify content
    if (center) classes.push('justify-center')
    if (between) classes.push('justify-between')
    if (around) classes.push('justify-around')
    if (evenly) classes.push('justify-evenly')
    if (start) classes.push('justify-start')
    if (end) classes.push('justify-end')

    // Align items
    if (center && !top && !bottom) classes.push('items-center')
    if (top) classes.push('items-start')
    if (middle) classes.push('items-center')
    if (bottom) classes.push('items-end')

    // Wrap
    if (wrap) classes.push('flex-wrap')
    if (nowrap) classes.push('flex-nowrap')

    // Grow/Shrink
    if (grow) classes.push('grow')
    if (shrink) classes.push('shrink')

    // Gap
    if (gap) {
        const gapSizes = {
            xs: 'gap-1',
            sm: 'gap-2',
            md: 'gap-4',
            lg: 'gap-6',
            xl: 'gap-8'
        } as const
        classes.push(gapSizes[gap])
    }

    const classString = classes.join(' ')

    return React.createElement(
        Component,
        {
            className: `${classString} ${className}`.trim(),
            style,
            onClick,
            ...rest
        },
        children
    )
}

Flex.displayName = 'Flex'

export { Flex }

/*
 * usage example:
 *	<Flex row>
 *		<div>Item 1</div>
 *		<div>Item 2</div>
 *	</Flex>
 */
