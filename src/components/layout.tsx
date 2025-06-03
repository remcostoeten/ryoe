import { Header } from './header'
import { MinimalFooter } from './minimal-footer'

type TProps = {
    children: React.ReactNode
}

export function Layout({ children }: TProps) {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 pb-12">{children}</main>
            <MinimalFooter />
        </div>
    )
}
