import { createBrowserRouter, RouterProvider } from 'react-router'
import { RootLayout } from '@/components/layout'

const router = createBrowserRouter([
    {
        path: '/',
        Component: RootLayout,
        children: [
            {
                index: true,
                lazy: async () => {
                    const module = await import('@/app/routes/home')
                    return { Component: module.Component }
                }
            },
                {
                    path: 'sign-in',
                    lazy: async () => {
                        const module = await import('@/app/routes/sign-in')
                        return { Component: module.SignInPage }
                    }
                },
                {
                    path: 'onboarding',
                    lazy: async () => {
                        const module = await import('@/app/routes/onboarding')
                        return { Component: module.Component }
                    }
                },
                {
                    path: 'logo',
                    lazy: async () => {
                        const module = await import('@/app/routes/docs/logo')
                        return { Component: module.default }
                    }
                },
                {
                    path: 'docs',
                    lazy: async () => {
                        const module = await import('@/app/routes/docs')
                        return { Component: module.default }
                    }
                },
                {
                    path: 'docs/storage',
                    lazy: async () => {
                        const module = await import('@/app/routes/docs/storage')
                        return { Component: module.default }
                    }
                },
                {
                    path: 'docs/db-operations',
                    lazy: async () => {
                        const module = await import('@/app/routes/docs/db-operations')
                        return { Component: module.Component }
                    }
                },
                {
                    path: 'docs/storage-api',
                    lazy: async () => {
                        const module = await import('@/app/routes/docs/storage-api')
                        return { Component: module.default }
                    }
                },
                {
                    path: 'docs/window-management',
                    lazy: async () => {
                        const module = await import(
                            '@/app/routes/docs/window-management'
                        )
                        return { Component: module.default }
                    }
                },
                {
                    path: 'docs/tech-stack',
                    lazy: async () => {
                        const module = await import('@/app/routes/docs/tech-stack')
                        return { Component: module.default }
                    }
                },
                {
                    path: 'docs/architecture',
                    lazy: async () => {
                        const module = await import('@/app/routes/docs/architecture')
                        return { Component: module.default }
                    }
                },
                {
                    path: 'folders',
                    lazy: async () => {
                        const module = await import('@/app/routes/folders')
                        return { Component: module.default }
                    }
                },
                {
                    path: 'notes',
                    lazy: async () => {
                        const module = await import('@/app/routes/notes')
                        return { Component: module.default }
                    }
                },
                {
                    path: 'notes/:noteId',
                    lazy: async () => {
                        const module = await import('@/app/routes/notes/[noteId]')
                        return { Component: module.default }
                    }
                },
                {
                    path: 'profile',
                    lazy: async () => {
                        const module = await import('@/app/routes/profile')
                        return { Component: module.Component }
                    }
                },
                {
                    path: 'port-manager',
                    lazy: async () => {
                        const module = await import('@/app/routes/port-manager')
                        return { Component: module.Component }
                    }
                },

                {
                    path: '*',
                    lazy: async () => {
                        const module = await import('@/app/routes/not-found')
                        return { Component: module.Component }
                    }
                }
            ]
        }
])

export default function AppRouter() {
    return <RouterProvider router={router} />
}
