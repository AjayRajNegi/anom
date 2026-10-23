import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { requireMembership } from "@/lib/dal";
import prisma from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;
	const cursor = searchParams.get("cursor") || undefined;

	const session = await auth.api.getSession({ headers: request.headers });
	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const membership = await requireMembership();
	const orgId = membership.activeOrg.id;

	const where = {
		organizationId: orgId,
		deletedAt: null,
		...(cursor ? { id: { lt: cursor } } : {}),
	};

	const PAGE_SIZE = 12;

	const videos = await prisma.video.findMany({
		where,
		select: {
			id: true,
			title: true,
			description: true,
			status: true,
			mimeType: true,
			sizeBytes: true,
			durationMs: true,
			width: true,
			height: true,
			createdAt: true,
			uploader: {
				select: { id: true, name: true, image: true },
			},
			_count: {
				select: { annotations: { where: { deletedAt: null } } },
			},
		},
		orderBy: { createdAt: "desc" },
		take: PAGE_SIZE + 1,
	});

	let nextCursor: string | null = null;
	let hasMore = false;

	if (videos.length > PAGE_SIZE) {
		const nextVideo = videos.pop();
		nextCursor = nextVideo!.id;
		hasMore = true;
	}

	const formattedVideos = videos.map((v) => ({
		...v,
		sizeBytes: Number(v.sizeBytes),
		annotationCount: v._count.annotations,
	}));

	return NextResponse.json({
		videos: formattedVideos,
		nextCursor,
		hasMore,
	});
}
