"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth/auth-client";
import { Button } from "../ui/button";
import { toastManager } from "../ui/toast";

export function SignoutButton() {
	const router = useRouter();
	const [pending, setPending] = useState(false);

	async function signout() {
		setPending(true);

		try {
			const { error } = await authClient.signOut();

			if (error) {
				toastManager.add({
					title: error.message ?? "Something went wrong.",
					type: "error",
				});
				return;
			}
			router.push("/login");
		} catch {
			toastManager.add({ title: "Something went wrong.", type: "error" });
		} finally {
			setPending(false);
		}
	}
	return (
		<div className="w-full">
			<Button
				variant="destructive-outline"
				aria-busy={pending}
				disabled={pending}
				onClick={signout}
				type="button"
				className="w-full"
			>
				{pending ? "Signing out..." : "Signout"}
			</Button>
		</div>
	);
}
