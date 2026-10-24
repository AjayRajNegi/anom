import prisma from "@/lib/db/prisma";

export async function addMemberToDemoOrf(userId: string) {
	const organizationId = "oUAuSJw9Ad6CF9nnsQZG1y1Lqn4GoNjF";

	await prisma.member.upsert({
		where: {
			organizationId_userId: {
				organizationId,
				userId,
			},
		},
		create: {
			organizationId,
			userId,
			role: "member",
		},
		update: {},
	});

	return userId;
}
