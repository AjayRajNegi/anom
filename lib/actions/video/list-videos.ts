"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { requireMembership } from "@/lib/dal";
import prisma from "@/lib/db/prisma";
import { VideoStatus } from "@/app/generated/prisma/enums";
import { z } from "zod";

const listVideosSchema = z.object({
	page: z.number().int().min(1).default(1),
	pageSize: z.number().int().min(1).max(50).default(20),
	status: z.nativeEnum(VideoStatus).optional(),
});

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
}

export interface ListVideosResult {
	success: boolean;
	videos?: VideoListItem[];
	total?: number;
	page?: number;
	pageSize?: number;
	error?: string;
}

export async function listVideos(
	input: unknown
): Promise<ListVideosResult> {
	// 1. Validate input
	const parsed = listVideosSchema.safeParse(input);
	if (!parsed.success) {
		return { success: false, error: "Invalid pagination params" };
	}

	const { page, pageSize, status } = parsed.data;

	// 2. Session
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user) {
		return { success: false, error: "Unauthorized" };
	}

	// 3. Membership
	const membership = await requireMembership();
	const orgId = membership.activeOrg.id;

	// 4. Query
	const where = {
		organizationId: orgId,
		deletedAt: null,
		...(status ? { status } : {}),
	};

	const [videos, total] = await Promise.all([
		prisma.video.findMany({
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
			},
			orderBy: { createdAt: "desc" },
			skip: (page - 1) * pageSize,
			take: pageSize,
		}),
		prisma.video.count({ where }),
	]);

	return {
		success: true,
		videos: videos.map((v) => ({
			...v,
			sizeBytes: Number(v.sizeBytes),
		})),
		total,
		page,
		pageSize,
	};
}