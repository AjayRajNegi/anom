import type { VideoStatus } from "@/app/generated/prisma/enums";
import { requireMembership } from "@/lib/dal";
import prisma from "@/lib/db/prisma";

export interface VideoListItem {
	id: string;
	title: string;
	description: string | null;
	status: VideoStatus;
	mimeType: string;
	sizeBytes: number;
	durationMs: number | null;
	width: number | null;
	height: number | null;
	createdAt: Date;
	uploader: {
		id: string;
		name: string;
		image: string | null;
	};
	annotationCount: number;
}

export interface ListVideosResult {
	videos: VideoListItem[];
	nextCursor: string | null;
	hasMore: boolean;
}

const PAGE_SIZE = 12;

export async function getVideos(cursor?: string): Promise<ListVideosResult> {
	const { activeOrg } = await requireMembership();
	if (!activeOrg.id) {
		return { videos: [], nextCursor: null, hasMore: false };
	}

	const orgId = activeOrg.id;

	const videos = await prisma.video.findMany({
		where: {
			organizationId: orgId,
			deletedAt: null,
			...(cursor ? { id: { lt: cursor } } : {}),
		},
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

	return {
		videos: videos.map((v) => ({
			...v,
			sizeBytes: Number(v.sizeBytes),
			annotationCount: v._count.annotations,
		})),
		nextCursor,
		hasMore,
	};
}
