import { createBrowserRouter, RouterProvider } from 'react-router'

const createAppRouter = () =>
    createBrowserRouter([
        {
            path: '/',
            lazy: () => import('@/app/routes/home')
        },
        {
            path: '/sign-in',
            lazy: async () => {
                const module = await import('@/app/routes/sign-in')
                return { Component: module.SignInPage }
            }
        },
        {
            path: '/docs',
            lazy: async () => {
                const module = await import('@/app/routes/docs')
                return { Component: module.default }
            }
        },
        {
            path: '/docs/storage',
            lazy: async () => {
                const module = await import('@/app/routes/docs/storage')
                return { Component: module.default }
            }
        },
        {
            path: '/docs/db-operations',
            lazy: () => import('@/app/routes/docs/db-operations')
        },
        {
            path: '/docs/storage-api',
            lazy: async () => {
                const module = await import('@/app/routes/docs/storage-api')
                return { Component: module.default }
            }
        },
        {
            path: '*',
            lazy: () => import('@/app/routes/not-found')
        }
    ])

export default function AppRouter() {
    return <RouterProvider router={createAppRouter()} />
}
