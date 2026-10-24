"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { VideoStatus } from "@/app/generated/prisma/enums";
import { auth } from "@/lib/auth/auth";
import { requireMembership } from "@/lib/dal";
import prisma from "@/lib/db/prisma";
import { getPresignedPlaybackUrl } from "@/lib/storage/presigned";

const getPlaybackUrlSchema = z.object({
	videoId: z.string().cuid(),
});

type VideoResult = {
	id: string;
	title: string;
	description: string | null;
	originalKey: string;
	mimeType: string;
	sizeBytes: bigint;
	durationMs: number | null;
	width: number | null;
	height: number | null;
	fps: number | null;
	uploader: {
		email: string;
		name: string;
		image: string | null;
	};
};

export type GetPlaybackUrlResult =
	| {
			success: false;
			error?: string;
	  }
	| {
			success: true;
			playbackUrl?: string;
			expiresIn?: number;
			video: VideoResult;
	  };

export async function getVideoPlaybackUrl(
	input: unknown,
): Promise<GetPlaybackUrlResult> {
	const parsed = getPlaybackUrlSchema.safeParse(input);
	if (!parsed.success) {
		return { success: false, error: "Invalid video ID" };
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
			status: VideoStatus.READY,
		},
		select: {
			id: true,
			title: true,
			description: true,
			mimeType: true,
			sizeBytes: true,
			durationMs: true,
			width: true,
			height: true,
			fps: true,
			originalKey: true,
			uploader: {
				select: {
					name: true,
					email: true,
					image: true,
				},
			},
		},
	});

	if (!video) {
		return { success: false, error: "Video not found or not ready" };
	}

	const { playbackUrl, expiresIn } = await getPresignedPlaybackUrl(
		video.originalKey,
	);

	return { success: true, playbackUrl, expiresIn, video };
}
