import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "./auth/auth";

export const requireUser = cache(async () => {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user) redirect("/login");
	return session.user;
});

export const requireRole = cache(async (role: "admin") => {
	const user = await requireUser();
	if (user.role !== role) redirect("/anom-org");
	return user;
});

export const requireMembership = cache(async () => {
	const user = await requireUser();
	const orgs = await auth.api.listOrganizations({
		headers: await headers(),
	});

	const orgId = "oUAuSJw9Ad6CF9nnsQZG1y1Lqn4GoNjF";

	const activeOrg = orgs.find((org) => org.id === orgId);

	if (!activeOrg) {
		redirect("/");
	}

	return { user, activeOrg };
});
