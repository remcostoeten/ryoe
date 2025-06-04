import { createBrowserRouter, RouterProvider } from 'react-router'
import { RootLayout } from '@/components/layout'

const createAppRouter = () =>
    createBrowserRouter([
        {
            path: '/',
            Component: RootLayout,
            children: [
                {
                    index: true,
                    lazy: () => import('@/app/routes/home')
                },
                {
                    path: 'sign-in',
                    lazy: async () => {
                        const module = await import('@/app/routes/sign-in')
                        return { Component: module.SignInPage }
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
                    lazy: () => import('@/app/routes/docs/db-operations')
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
                    path: '*',
                    lazy: () => import('@/app/routes/not-found')
                }
            ]
        }
    ])

export default function AppRouter() {
    return <RouterProvider router={createAppRouter()} />
}
