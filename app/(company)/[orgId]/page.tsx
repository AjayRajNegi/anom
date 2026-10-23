import { requireMembership } from "@/lib/dal";

export default async function OrgPage() {
	const active = await requireMembership();
	console.log(active);
	return (
		<div className="flex flex-col h-screen w-screen items-center justify-center">
			<div className="uppercase tracking-widest text-3xl">Org Page</div>
		</div>
	);
}
