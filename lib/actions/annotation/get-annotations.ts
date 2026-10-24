"use server";

import { headers } from "next/headers";
import { z } from "zod";
import type { AnnotationStatus } from "@/app/generated/prisma/client";
import { auth } from "@/lib/auth/auth";
import { requireMembership } from "@/lib/dal";
import prisma from "@/lib/db/prisma";

const getVideoAnnotationsSchema = z.object({
	videoId: z.string().cuid(),
});

export type GetVideoAnnotationsInput = z.infer<
	typeof getVideoAnnotationsSchema
>;

export type VideoAnnotationItem = {
	id: string;
	videoId: string;
	authorId: string;
	startMs: number;
	endMs: number;
	body: string;
	status: AnnotationStatus;
	screenshotKey: string | null;
	createdAt: Date;
	updatedAt: Date;
	replies: {
		id: string;
		authorId: string;
		body: string;
		createdAt: Date;
	}[];
};

export type GetVideoAnnotationsResult =
	| {
			success: true;
			annotations: VideoAnnotationItem[];
	  }
	| {
			success: false;
			error: string;
	  };

export async function getVideoAnnotations(
	input: GetVideoAnnotationsInput,
): Promise<GetVideoAnnotationsResult> {
	const parsed = getVideoAnnotationsSchema.safeParse(input);

	if (!parsed.success) {
		return {
			success: false,
			error: "Invalid video ID.",
		};
	}

	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user) {
			return { success: false, error: "Unauthorized." };
		}

		const membership = await requireMembership();
		const organizationId = membership.activeOrg.id;
		const { videoId } = parsed.data;

		const video = await prisma.video.findFirst({
			where: {
				id: videoId,
				organizationId,
				deletedAt: null,
			},
			select: {
				id: true,
			},
		});

		if (!video) {
			return {
				success: false,
				error: "Video not found or unavailable.",
			};
		}

		const annotations = await prisma.annotation.findMany({
			where: {
				videoId,
				organizationId,
				deletedAt: null,
			},
			select: {
				id: true,
				videoId: true,
				authorId: true,
				startMs: true,
				endMs: true,
				body: true,
				status: true,
				screenshotKey: true,
				createdAt: true,
				updatedAt: true,
				replies: {
					where: {
						deletedAt: null,
					},
					orderBy: {
						createdAt: "asc",
					},
					select: {
						id: true,
						authorId: true,
						body: true,
						createdAt: true,
					},
				},
			},
			orderBy: [{ startMs: "asc" }, { id: "asc" }],
		});

		return {
			success: true,
			annotations,
		};
	} catch (error) {
		console.error("Failed to fetch video annotations:", error);

		return {
			success: false,
			error: "Unable to load annotations. Please try again.",
		};
	}
}
