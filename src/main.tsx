import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app'
import { Providers } from './components/provider'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<React.StrictMode>
		<Providers>
			<App />
		</Providers>
	</React.StrictMode>
)
