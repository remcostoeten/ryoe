/**
 * Utility functions index
 * Re-exports all utility functions for easy importing
 */

// Environment utilities
export {
	isTauriEnvironment,
	isDesktopEnvironment,
	isWebEnvironment,
	isBrowserEnvironment,
	isNodeEnvironment,
	isServerSideRendering,
	getEnvironmentType,
	getUserAgent,
	getPlatform,
	isOnline,
	waitForTauri,
	debugEnvironment,
	getEnvironmentDetails,
} from './environment'

// Styling utilities
export { cn, createClassNames, mergeClassNames } from './styling'

// Formatting utilities
export {
	formatDate,
	formatDateTime,
	formatRelativeTime,
	capitalize,
	capitalizeWords,
	truncate,
	slugify,
	formatNumber,
	formatBytes,
	formatPercentage,
	countWords,
	calculateReadingTime,
} from './formatting'

// Validation utilities
export {
	isEmail,
	isUrl,
	isValidUsername,
	isValidPath,
	isValidJson,
	isEmpty,
	isNotEmpty,
	hasMinLength,
	hasMaxLength,
	isInRange,
	isPositiveNumber,
	isNonNegativeNumber,
	validateNoteTitle,
	validateNoteContent,
	validateFolderName,
} from './validation'

// Package reader utilities
export {
	getTechStack,
	readPackageJson,
	type TechStackItem,
	type TechStackCategory,
	type PackageInfo,
} from './package-reader'

// Development utilities
export { setupHMRErrorHandling, isDevMode, showConnectionStatus } from './dev-server'
