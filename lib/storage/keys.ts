import {
	VIDEO_MIME_TO_EXT,
	VIDEO_MIME_TYPES,
	type VideoMimeType,
} from "./constants";

export type StorageKeyType = "video" | "poster" | "screenshot";

interface BuildKeyOptions {
	orgId: string;
	videoId: string;
	type: StorageKeyType;
	mimeType: string;
	suffix?: string;
}

export function buildStorageKey(opts: BuildKeyOptions): string {
	const { orgId, videoId, type, mimeType, suffix } = opts;

	const ext = VIDEO_MIME_TO_EXT[mimeType as VideoMimeType] ?? "bin";
	const base = `${type}${suffix ? `-${suffix}` : ""}.${ext}`;

	return `orgs/${orgId}/videos/${videoId}/${base}`;
}

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

export function validateVideoMimeType(mimeType: string): boolean {
	return VIDEO_MIME_TYPES.includes(
		mimeType as (typeof VIDEO_MIME_TYPES)[number],
	);
}

export function getVideoExtension(mimeType: string): string {
	return VIDEO_MIME_TO_EXT[mimeType as VideoMimeType] ?? "mp4";
}
