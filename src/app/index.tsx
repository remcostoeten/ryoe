import { Providers } from '@/components/provider'
import './global.css'

import AppRouter from '@/app/router'

export default function App() {
    return (
        <Providers>
            <AppRouter />
        </Providers>
    )
}
