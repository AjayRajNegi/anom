export const VIDEO_MIME_TYPES = [
	"video/mp4",
	"video/webm",
	"video/quicktime", // .mov
	"video/x-msvideo", // .avi
	"video/x-matroska", // .mkv
] as const;

export type VideoMimeType = (typeof VIDEO_MIME_TYPES)[number];

export const VIDEO_MIME_TO_EXT: Record<VideoMimeType, string> = {
	"video/mp4": "mp4",
	"video/webm": "webm",
	"video/quicktime": "mov",
	"video/x-msvideo": "avi",
	"video/x-matroska": "mkv",
} as const;

export const MAX_VIDEO_SIZE_BYTES = 5 * 1024 * 1024 * 1024;

export const MIN_VIDEO_SIZE_BYTES = 1024;

export const PRESIGNED_UPLOAD_EXPIRY = 15 * 60; // 15 minutes
export const PRESIGNED_PLAYBACK_EXPIRY = 60 * 60; // 1 hour
