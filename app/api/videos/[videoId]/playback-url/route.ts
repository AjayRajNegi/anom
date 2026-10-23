import { type NextRequest, NextResponse } from "next/server";
import { VideoStatus } from "@/app/generated/prisma/enums";
import { auth } from "@/lib/auth/auth";
import { requireMembership } from "@/lib/dal";
import prisma from "@/lib/db/prisma";
import { getPresignedPlaybackUrl } from "@/lib/storage/presigned";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ videoId: string }> },
) {
	const { videoId } = await params;

	const session = await auth.api.getSession({ headers: request.headers });
	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
		select: { originalKey: true },
	});

	if (!video) {
		return NextResponse.json(
			{ error: "Video not found or not ready" },
			{ status: 404 },
		);
	}

	const { playbackUrl, expiresIn } = await getPresignedPlaybackUrl(
		video.originalKey,
	);

	return NextResponse.json({
		success: true,
		playbackUrl,
		expiresIn,
	});
}
