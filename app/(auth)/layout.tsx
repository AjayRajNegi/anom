import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";

export default async function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (session) {
		redirect("/anom-org");
	}

	return (
		<main className="mx-auto mt-[15%] flex max-w-sm flex-col items-center justify-center rounded-sm px-4 py-4">
			{children}
		</main>
	);
}
