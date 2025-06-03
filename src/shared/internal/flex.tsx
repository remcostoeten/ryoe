import React, { type JSX, type ReactNode } from 'react'

type Direction = 'row' | 'col' | 'row-reverse' | 'col-reverse'
type Justify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
type Align = 'start' | 'center' | 'end' | 'stretch'

type TProps = {
    children: ReactNode
    row?: boolean
    col?: boolean
    reverse?: boolean
    sm?: Direction
    md?: Direction
    lg?: Direction
    xl?: Direction
    '2xl'?: Direction
    start?: boolean
    center?: boolean
    end?: boolean
    between?: boolean
    around?: boolean
    evenly?: boolean
    'justify-sm'?: Justify
    'justify-md'?: Justify
    'justify-lg'?: Justify
    'justify-xl'?: Justify
    'justify-2xl'?: Justify
    'items-start'?: boolean
    'items-center'?: boolean
    'items-end'?: boolean
    'items-stretch'?: boolean
    'items-sm'?: Align
    'items-md'?: Align
    'items-lg'?: Align
    'items-xl'?: Align
    'items-2xl'?: Align
    wrap?: boolean
    nowrap?: boolean
    'wrap-reverse'?: boolean
    grow?: boolean
    shrink?: boolean
    gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number
    'gap-sm'?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number
    'gap-md'?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number
    'gap-lg'?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number
    'gap-xl'?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number
    'gap-2xl'?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number
    className?: string
    style?: React.CSSProperties
    onClick?: () => void
    as?: keyof JSX.IntrinsicElements
}

function Flex({
    children,
    row,
    col,
    reverse,
    sm,
    md,
    lg,
    xl,
    '2xl': xl2,
    start,
    center,
    end,
    between,
    around,
    evenly,
    'justify-sm': justifySm,
    'justify-md': justifyMd,
    'justify-lg': justifyLg,
    'justify-xl': justifyXl,
    'justify-2xl': justify2xl,
    'items-start': itemsStart,
    'items-center': itemsCenter,
    'items-end': itemsEnd,
    'items-stretch': itemsStretch,
    'items-sm': itemsSm,
    'items-md': itemsMd,
    'items-lg': itemsLg,
    'items-xl': itemsXl,
    'items-2xl': items2xl,
    wrap,
    nowrap,
    'wrap-reverse': wrapReverse,
    grow,
    shrink,
    gap,
    'gap-sm': gapSm,
    'gap-md': gapMd,
    'gap-lg': gapLg,
    'gap-xl': gapXl,
    'gap-2xl': gap2xl,
    className = '',
    style,
    onClick,
    as: Component = 'div',
    ...rest
}: TProps) {
    const classes = ['flex']

    if (col) {
        classes.push(reverse ? 'flex-col-reverse' : 'flex-col')
    } else if (row || (!col && !sm && !md && !lg && !xl && !xl2)) {
        classes.push(reverse ? 'flex-row-reverse' : 'flex-row')
    }

    if (sm) classes.push(`sm:flex-${sm}`)
    if (md) classes.push(`md:flex-${md}`)
    if (lg) classes.push(`lg:flex-${lg}`)
    if (xl) classes.push(`xl:flex-${xl}`)
    if (xl2) classes.push(`2xl:flex-${xl2}`)

    if (start) classes.push('justify-start')
    if (center && !between && !around && !evenly && !end)
        classes.push('justify-center')
    if (end) classes.push('justify-end')
    if (between) classes.push('justify-between')
    if (around) classes.push('justify-around')
    if (evenly) classes.push('justify-evenly')

    // Responsive justify
    if (justifySm) classes.push(`sm:justify-${justifySm}`)
    if (justifyMd) classes.push(`md:justify-${justifyMd}`)
    if (justifyLg) classes.push(`lg:justify-${justifyLg}`)
    if (justifyXl) classes.push(`xl:justify-${justifyXl}`)
    if (justify2xl) classes.push(`2xl:justify-${justify2xl}`)

    // Base align items
    if (itemsStart) classes.push('items-start')
    if (itemsCenter || (center && !itemsStart && !itemsEnd && !itemsStretch))
        classes.push('items-center')
    if (itemsEnd) classes.push('items-end')
    if (itemsStretch) classes.push('items-stretch')

    // Responsive align items
    if (itemsSm) classes.push(`sm:items-${itemsSm}`)
    if (itemsMd) classes.push(`md:items-${itemsMd}`)
    if (itemsLg) classes.push(`lg:items-${itemsLg}`)
    if (itemsXl) classes.push(`xl:items-${itemsXl}`)
    if (items2xl) classes.push(`2xl:items-${items2xl}`)

    // Wrap
    if (wrap) classes.push('flex-wrap')
    if (nowrap) classes.push('flex-nowrap')
    if (wrapReverse) classes.push('flex-wrap-reverse')

    // Grow/Shrink
    if (grow) classes.push('grow')
    if (shrink) classes.push('shrink')

    // Gap helper
    const getGapClass = (gapValue: string | number, prefix = '') => {
        if (typeof gapValue === 'number') {
            return `${prefix}gap-${gapValue}`
        }
        const gapSizes = {
            xs: '1',
            sm: '2',
            md: '4',
            lg: '6',
            xl: '8'
        }
        return `${prefix}gap-${gapSizes[gapValue as keyof typeof gapSizes]}`
    }

    // Base gap
    if (gap) classes.push(getGapClass(gap))

    // Responsive gap
    if (gapSm) classes.push(getGapClass(gapSm, 'sm:'))
    if (gapMd) classes.push(getGapClass(gapMd, 'md:'))
    if (gapLg) classes.push(getGapClass(gapLg, 'lg:'))
    if (gapXl) classes.push(getGapClass(gapXl, 'xl:'))
    if (gap2xl) classes.push(getGapClass(gap2xl, '2xl:'))

    return React.createElement(
        Component,
        {
            className: `${classes.join(' ')} ${className}`.trim(),
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
 * Usage examples:
 *
 * <Flex col center between>
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 * </Flex>
 *
 * <Flex row end justify-end>
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 * </Flex>
 *
 * <Flex sm="row" col items-center justify-between>
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 * </Flex>
 *
 * <Flex col sm="row" md="col" justify-sm="center" items-md="start" gap="md" gap-lg="xl">
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 * </Flex>
 */
