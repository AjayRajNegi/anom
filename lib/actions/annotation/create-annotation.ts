"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { requireMembership } from "@/lib/dal";
import prisma from "@/lib/db/prisma";
import {
	type CreateAnnotationInput,
	createAnnotationSchema,
} from "@/lib/validations/video.schema";

export type CreateAnnotationResult =
	| {
			success: true;
			result: { id: string };
	  }
	| {
			success: false;
			error: string;
	  };

export async function createAnnotation(
	input: CreateAnnotationInput,
): Promise<CreateAnnotationResult> {
	const parsed = createAnnotationSchema.safeParse(input);

	if (!parsed.success) {
		return {
			success: false,
			error: parsed.error.message,
		};
	}

	const { videoId, startMs, endMs, body } = parsed.data;

	console.log(videoId, startMs, endMs, body);

	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		return {
			success: false,
			error: "Unauthorized",
		};
	}

	const membership = await requireMembership();
	const orgId = membership.activeOrg.id;

	const video = await prisma.video.findFirst({
		where: {
			id: videoId,
			organizationId: orgId,
		},
		select: {
			id: true,
		},
	});

	if (!video) {
		return {
			success: false,
			error: "Video not found.",
		};
	}

	try {
		const annotation = await prisma.annotation.create({
			data: {
				videoId,
				organizationId: orgId,
				authorId: session.user.id,
				startMs,
				endMs,
				body,
			},
			select: {
				id: true,
			},
		});

		return {
			success: true,
			result: annotation,
		};
	} catch (error) {
		console.error("Failed to create annotation:", error);

		return {
			success: false,
			error: "Unable to create annotation. Please try again.",
		};
	}
}
