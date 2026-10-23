import { VIDEO_MIME_TO_EXT, VIDEO_MIME_TYPES, type VideoMimeType } from "./constants";

export type StorageKeyType = "video" | "poster" | "screenshot";

interface BuildKeyOptions {
	orgId: string;
	videoId: string;
	type: StorageKeyType;
	mimeType: string;
	/**
	 * Optional suffix for variants (e.g., poster timestamps, screenshot index)
	 */
	suffix?: string;
}

/**
 * Build a deterministic storage key.
 * Never uses user-supplied filenames. Extension derived from validated MIME type.
 * Format: orgs/{orgId}/videos/{videoId}/{type}-{suffix}.{ext}
 */
export function buildStorageKey(opts: BuildKeyOptions): string {
	const { orgId, videoId, type, mimeType, suffix } = opts;

	const ext = VIDEO_MIME_TO_EXT[mimeType as VideoMimeType] ?? "bin";
	const base = `${type}${suffix ? `-${suffix}` : ""}.${ext}`;

	return `orgs/${orgId}/videos/${videoId}/${base}`;
}

/**
 * Parse a storage key back into its components (for verification/debugging).
 * Returns null if the key doesn't match the expected pattern.
 */
export function parseStorageKey(key: string): {
	orgId: string;
	videoId: string;
	type: StorageKeyType;
	ext: string;
} | null {
	const match = key.match(
		/^orgs\/([^/]+)\/videos\/([^/]+)\/(video|poster|screenshot)(?:-([^.]+))?\.([^.]+)$/,
	);
	if (!match) return null;

	const [, orgId, videoId, type, , ext] = match;
	return { orgId, videoId, type: type as StorageKeyType, ext };
}

/**
 * Validate that a MIME type is allowed for video uploads.
 */
export function validateVideoMimeType(mimeType: string): boolean {
	return VIDEO_MIME_TYPES.includes(
		mimeType as (typeof VIDEO_MIME_TYPES)[number],
	);
}

/**
 * Get the expected extension for a validated video MIME type.
 */
export function getVideoExtension(mimeType: string): string {
	return VIDEO_MIME_TO_EXT[mimeType as VideoMimeType] ?? "mp4";
}
