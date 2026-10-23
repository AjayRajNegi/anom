"use client";

import { authClient } from "@/lib/auth/auth-client";
import { SignoutButton } from "../auth/signout-button";

export function Footer() {
	const { data: session } = authClient.useSession();

	return (
		<footer className="fixed bottom-0 left-0 z-[20] flex h-[70px] w-screen items-center justify-end">
			{session?.user ? (
				<div className="mr-5">
					<SignoutButton />
				</div>
			) : (
				<p className="mr-5">anom</p>
			)}
		</footer>
	);
}
