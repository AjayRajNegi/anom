"use server";

import { requireMembership } from "@/lib/dal";
import prisma from "@/lib/db/prisma";

export interface ListMembersResult {
	success: boolean;
	error?: string;
	user?: { user: { email: string; name: string; image: string | null } }[];
}

export async function listMembers(): Promise<ListMembersResult> {
	const { activeOrg } = await requireMembership();

	if (!activeOrg) {
		return { success: false, error: "No active organization" };
	}

	const data = await prisma.member.findMany({
		where: {
			organizationId: activeOrg.id,
		},
		select: {
			user: {
				select: {
					name: true,
					email: true,
					image: true,
				},
			},
		},

		orderBy: { createdAt: "desc" },
	});

	return { success: true, user: data };
}
