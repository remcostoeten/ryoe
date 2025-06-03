import { appConfig } from '@/app/config'

export function VersionTest() {
    return (
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Version Test</h3>
            <div className="space-y-2 text-sm">
                <div>
                    <strong>App Name:</strong> {appConfig.name}
                </div>
                <div>
                    <strong>App Version:</strong> {appConfig.version}
                </div>
                <div>
                    <strong>Global __APP_VERSION__:</strong> {typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'undefined'}
                </div>
                <div>
                    <strong>Global __APP_NAME__:</strong> {typeof __APP_NAME__ !== 'undefined' ? __APP_NAME__ : 'undefined'}
                </div>
            </div>
        </div>
    )
}
