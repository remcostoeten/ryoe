import { Header } from './header'

type TProps = {
    children: React.ReactNode
}

export function Layout({ children }: TProps) {
    return (
        <div>
            <Header />
            <main>{children}</main>
        </div>
    )
}
