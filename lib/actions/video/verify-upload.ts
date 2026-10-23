"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { VideoStatus } from "@/app/generated/prisma/enums";
import { auth } from "@/lib/auth/auth";
import { requireMembership } from "@/lib/dal";
import prisma from "@/lib/db/prisma";
import { verifyUpload } from "@/lib/storage/presigned";

const verifyUploadSchema = z.object({
	videoId: z.string().cuid(),
});

export interface VerifyUploadResult {
	success: boolean;
	video?: {
		id: string;
		status: VideoStatus;
		playbackUrl?: string;
	};
	error?: string;
}

export async function verifyVideoUpload(
	input: unknown,
): Promise<VerifyUploadResult> {
	const parsed = verifyUploadSchema.safeParse(input);
	if (!parsed.success) {
		return {
			success: false,
			error: "Invalid video ID",
		};
	}

	const { videoId } = parsed.data;
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user) {
		return { success: false, error: "Unauthorized" };
	}
	const membership = await requireMembership();
	const orgId = membership.activeOrg.id;

	const video = await prisma.video.findFirst({
		where: {
			id: videoId,
			organizationId: orgId,
			deletedAt: null,
		},
		select: {
			id: true,
			originalKey: true,
			mimeType: true,
			sizeBytes: true,
			status: true,
		},
	});

	if (!video) {
		return { success: false, error: "Video not found" };
	}

	if (video.status !== VideoStatus.UPLOADING) {
		return { success: false, error: "Video is not in uploading state" };
	}

	const verification = await verifyUpload(
		video.originalKey,
		Number(video.sizeBytes),
		video.mimeType,
	);

	if (!verification.verified) {
		await prisma.video.update({
			where: { id: videoId },
			data: { status: VideoStatus.FAILED },
		});
		return {
			success: false,
			error: `Upload verification failed: expected ${video.sizeBytes} bytes (${video.mimeType}), got ${verification.actualSize} bytes (${verification.actualMimeType})`,
		};
	}

	const updatedVideo = await prisma.video.update({
		where: { id: videoId },
		data: { status: VideoStatus.READY },
		select: { id: true, status: true },
	});

	return {
		success: true,
		video: {
			id: updatedVideo.id,
			status: updatedVideo.status,
		},
	};
}
