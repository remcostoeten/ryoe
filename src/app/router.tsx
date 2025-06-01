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
            path: '*',
            lazy: () => import('@/app/routes/not-found')
        }
    ])

export default function AppRouter() {
    return <RouterProvider router={createAppRouter()} />
}
