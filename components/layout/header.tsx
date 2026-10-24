"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth/auth-client";
import { ModeToggle } from "../ui/mode-toggle";

export function Header() {
	const { data: session } = authClient.useSession();

	return (
		<nav className="fixed top-0 left-0 flex h-[70px] w-screen items-center justify-end">
			{session?.user ? (
				session?.user && (
					<>
						<Link className="mr-5" href="/anom-org/profile">
							Profile
						</Link>
						<div className="mr-5 flex items-center">
							<ModeToggle />
						</div>
					</>
				)
			) : (
				<>
					<Link className="mr-5" href="/login">
						Login
					</Link>
					<Link className="mr-5" href="/register">
						Register
					</Link>
					<div className="mr-5 flex items-center">
						<ModeToggle />
					</div>
				</>
			)}
		</nav>
	);
}
