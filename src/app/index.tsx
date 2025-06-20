import { ErrorBoundary } from '@/components/ErrorBoundary'
import './global.css'

import AppRouter from '@/app/router'

export default function App() {
	return (
		<ErrorBoundary>
			<AppRouter />
		</ErrorBoundary>
	)
}
