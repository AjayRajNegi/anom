"use server";

import { headers } from "next/headers";
import { VideoStatus } from "@/app/generated/prisma/enums";
import { auth } from "@/lib/auth/auth";
import { requireMembership } from "@/lib/dal";
import prisma from "@/lib/db/prisma";
import { getPresignedUploadUrl } from "@/lib/storage/presigned";
import { createVideoSchema } from "@/lib/validations/video.schema";

export type CreateVideoResult =
	| {
			success: true;
			videoId: string;
			uploadUrl: string;
			key: string;
			headers: Record<string, string>;
			expiresIn: number;
	  }
	| {
			success: false;
			error: string;
	  };

export async function createVideo(input: unknown): Promise<CreateVideoResult> {
	const parsed = createVideoSchema.safeParse(input);
	if (!parsed.success) {
		return {
			success: false,
			error: parsed.error.flatten().fieldErrors
				? Object.values(parsed.error.flatten().fieldErrors).flat().join(", ")
				: "Invalid input",
		};
	}

	const { title, description, mimeType, sizeBytes, duration } = parsed.data;

	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user) {
		return { success: false, error: "Unauthorized" };
	}

	const membership = await requireMembership();
	const orgId = membership.activeOrg.id;
	const userId = session.user.id;

	const video = await prisma.video.create({
		data: {
			organizationId: orgId,
			uploaderId: userId,
			title,
			description,
			status: VideoStatus.UPLOADING,
			originalKey: "",
			mimeType,
			sizeBytes: BigInt(sizeBytes),
			durationMs: duration * 1000,
		},
		select: { id: true },
	});

	const presigned = await getPresignedUploadUrl(
		orgId,
		video.id,
		mimeType,
		sizeBytes,
	);

	await prisma.video.update({
		where: { id: video.id },
		data: { originalKey: presigned.key },
	});

	return {
		success: true,
		videoId: video.id,
		uploadUrl: presigned.uploadUrl,
		key: presigned.key,
		headers: presigned.headers,
		expiresIn: presigned.expiresIn,
	};
}
