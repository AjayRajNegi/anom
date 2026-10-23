import { z } from "zod";
import {
	MAX_VIDEO_SIZE_BYTES,
	MIN_VIDEO_SIZE_BYTES,
	VIDEO_MIME_TYPES,
} from "@/lib/storage/constants";

export const createVideoSchema = z.object({
	title: z.string().trim().min(1, "Title is required").max(200),
	description: z.string().trim().max(5000).optional(),
	mimeType: z.enum(VIDEO_MIME_TYPES),
	sizeBytes: z
		.number()
		.int()
		.min(MIN_VIDEO_SIZE_BYTES, "File too small")
		.max(MAX_VIDEO_SIZE_BYTES, "File too large (max 5GB)"),
});

export type CreateVideoInput = z.infer<typeof createVideoSchema>;

export const createAnnotationSchema = z.object({
	videoId: z.string().cuid(),
	startMs: z.number().int().min(0),
	endMs: z.number().int().min(1),
	body: z.string().trim().min(1, "Comment is required").max(2000),
});

export type CreateAnnotationInput = z.infer<typeof createAnnotationSchema>;
