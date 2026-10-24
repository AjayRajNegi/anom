"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { requireMembership } from "@/lib/dal";
import prisma from "@/lib/db/prisma";

const deleteAnnotationSchema = z.object({
	annotationId: z.string().cuid(),
});

export type DeleteAnnotationInput = z.infer<typeof deleteAnnotationSchema>;

export type DeleteAnnotationResult =
	| { success: true }
	| { success: false; error: string };

export async function deleteAnnotation(
	input: DeleteAnnotationInput,
): Promise<DeleteAnnotationResult> {
	const parsed = deleteAnnotationSchema.safeParse(input);

	if (!parsed.success) {
		return {
			success: false,
			error: "Invalid annotation ID.",
		};
	}

	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user) {
			return {
				success: false,
				error: "Unauthorized.",
			};
		}

		const membership = await requireMembership();
		const organizationId = membership.activeOrg.id;

		const result = await prisma.annotation.updateMany({
			where: {
				id: parsed.data.annotationId,
				organizationId,
				authorId: session.user.id,
				deletedAt: null,
			},
			data: {
				deletedAt: new Date(),
			},
		});

		if (result.count === 0) {
			return {
				success: false,
				error: "Annotation not found or you cannot delete it.",
			};
		}

		return { success: true };
	} catch (error) {
		console.error("Failed to delete annotation:", error);

		return {
			success: false,
			error: "Unable to delete annotation. Please try again.",
		};
	}
}
