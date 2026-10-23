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

export interface GetPlaybackUrlResult {
	success: boolean;
	playbackUrl?: string;
	expiresIn?: number;
	error?: string;
}

export async function getVideoPlaybackUrl(
	input: unknown,
): Promise<GetPlaybackUrlResult> {
	// 1. Validate input
	const parsed = getPlaybackUrlSchema.safeParse(input);
	if (!parsed.success) {
		return { success: false, error: "Invalid video ID" };
	}

	const { videoId } = parsed.data;

	// 2. Session
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user) {
		return { success: false, error: "Unauthorized" };
	}

	// 3. Membership
	const membership = await requireMembership();
	const orgId = membership.activeOrg.id;

	// 4. Get video (must belong to org and be READY)
	const video = await prisma.video.findFirst({
		where: {
			id: videoId,
			organizationId: orgId,
			deletedAt: null,
			status: VideoStatus.READY,
		},
		select: { originalKey: true },
	});

	if (!video) {
		return { success: false, error: "Video not found or not ready" };
	}

	// 5. Generate presigned playback URL
	const { playbackUrl, expiresIn } = await getPresignedPlaybackUrl(
		video.originalKey,
	);

	return { success: true, playbackUrl, expiresIn };
}
