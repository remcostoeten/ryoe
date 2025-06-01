import { relaunch } from '@tauri-apps/plugin-process'
import { Button } from '@/components/ui/button'
import {
    ErrorView,
    ErrorHeader,
    ErrorDescription,
    ErrorActions
} from '@/features/errors/error-base'
import { isTauriEnvironment } from '@/lib/environment'

export default function AppErrorPage() {
    const handleRestart = () => {
        if (isTauriEnvironment()) {
            relaunch()
        } else {
            window.location.reload()
        }
    }

    return (
        <ErrorView>
            <ErrorHeader>We&apos;re fixing it</ErrorHeader>
            <ErrorDescription>
                The app encountered an error and needs to be restarted.
                <br />
                We know about it and we&apos;re working to fix it.
            </ErrorDescription>
            <ErrorActions>
                <Button size="lg" onClick={handleRestart}>
                    {isTauriEnvironment() ? 'Relaunch app' : 'Reload page'}
                </Button>
            </ErrorActions>
        </ErrorView>
    )
}
