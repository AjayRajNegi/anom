import {
	GetObjectCommand,
	HeadObjectCommand,
	PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { VideoMimeType } from "./constants";
import {
	PRESIGNED_PLAYBACK_EXPIRY,
	PRESIGNED_UPLOAD_EXPIRY,
} from "./constants";
import { buildStorageKey, validateVideoMimeType } from "./keys";
import { R2_BUCKET, r2 } from "./r2";

export interface PresignedUploadResult {
	uploadUrl: string;
	key: string;
	expiresIn: number;
	headers: Record<string, string>;
}

export interface PresignedPlaybackResult {
	playbackUrl: string;
	expiresIn: number;
}

export async function getPresignedUploadUrl(
	orgId: string,
	videoId: string,
	mimeType: VideoMimeType,
	contentLength: number,
): Promise<PresignedUploadResult> {
	if (!validateVideoMimeType(mimeType)) {
		throw new Error(`Unsupported video MIME type: ${mimeType}`);
	}

	const key = buildStorageKey({
		orgId,
		videoId,
		type: "video",
		mimeType,
	});

	const command = new PutObjectCommand({
		Bucket: R2_BUCKET,
		Key: key,
		ContentType: mimeType,
		ContentLength: contentLength,
	});

	const uploadUrl = await getSignedUrl(r2, command, {
		expiresIn: PRESIGNED_UPLOAD_EXPIRY,
	});

	return {
		uploadUrl,
		key,
		expiresIn: PRESIGNED_UPLOAD_EXPIRY,
		headers: {
			"Content-Type": mimeType,
			"Content-Length": String(contentLength),
		},
	};
}

export async function getPresignedPlaybackUrl(
	key: string,
): Promise<PresignedPlaybackResult> {
	const command = new GetObjectCommand({
		Bucket: R2_BUCKET,
		Key: key,
	});

	const playbackUrl = await getSignedUrl(r2, command, {
		expiresIn: PRESIGNED_PLAYBACK_EXPIRY,
	});

	return {
		playbackUrl,
		expiresIn: PRESIGNED_PLAYBACK_EXPIRY,
	};
}

export async function verifyUpload(
	key: string,
	expectedSize: number,
	expectedMimeType: string,
): Promise<{ verified: boolean; actualSize: number; actualMimeType: string }> {
	const command = new HeadObjectCommand({
		Bucket: R2_BUCKET,
		Key: key,
	});

	const response = await r2.send(command);

	const actualSize = Number(response.ContentLength ?? 0);
	const actualMimeType = response.ContentType ?? "";

	const sizeMatch = actualSize === expectedSize;
	const typeMatch = actualMimeType === expectedMimeType;

	return {
		verified: sizeMatch && typeMatch,
		actualSize,
		actualMimeType,
	};
}

export async function deleteObject(key: string): Promise<void> {
	const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");
	const command = new DeleteObjectCommand({
		Bucket: R2_BUCKET,
		Key: key,
	});
	await r2.send(command);
}
