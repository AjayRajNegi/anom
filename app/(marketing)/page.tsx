"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
	return (
		<>
			{/* <Header /> */}
			<div className="flex flex-col h-screen w-screen items-center justify-center">
				<div className="uppercase tracking-widest text-3xl">Marketing Page</div>
				<Button className="font-thin mt-1">
					<Link href={"/org123"}>You company dashboard</Link>
				</Button>
			</div>
			{/* <Footer /> */}
		</>
	);
}
