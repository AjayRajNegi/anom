import prisma from "@/lib/db/prisma";

export async function addMemberToDemoOrf(userId: string) {
	await prisma.member.create({
		data: {
			organizationId: "oUAuSJw9Ad6CF9nnsQZG1y1Lqn4GoNjF",
			userId,
			role: "member",
		},
	});
	return userId;
}
