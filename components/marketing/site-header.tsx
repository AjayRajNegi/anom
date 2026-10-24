"use client";

import { User2Icon, Waypoints } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/auth-client";

const links = [
	["Docs", "#"],
	["Pricing", "#pricing"],
	["Changelog", "#"],
] as const;

export function SiteHeader() {
	const session = authClient.useSession();

	return (
		<header className="mx-auto flex h-20 w-full max-w-[1400px] items-center justify-between px-6 lg:px-10">
			<div className="flex items-center gap-10">
				<Link
					href="/"
					className="flex items-center gap-2.5 text-[22px] font-medium tracking-tight"
				>
					<Waypoints className="size-6" strokeWidth={1.75} />
					Fernway
				</Link>
				<nav className="hidden items-center gap-8 md:flex">
					{links.map(([label, href]) => (
						<Link
							key={label}
							href={href}
							className="text-[15px] text-muted-foreground transition-colors hover:text-foreground"
						>
							{label}
						</Link>
					))}
				</nav>
			</div>
			<div className="flex items-center gap-1">
				<Button variant="ghost" className="text-muted-foreground">
					{session.data !== null ? (
						<Link
							href="/anom-org"
							className="border border-foreground rounded-full p-1"
						>
							<User2Icon className="text-foreground" />
						</Link>
					) : (
						<Link href="/register">Sign in</Link>
					)}
				</Button>
				<div className="px-5 py-2 rounded-full bg-foreground text-background">
					<Link href="/anom-org">Get started</Link>
				</div>
			</div>
		</header>
	);
}
