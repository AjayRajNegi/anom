import Link from "next/link";
import { AnnotationDemo } from "@/components/marketing/annotation-demo";
import { Meadow } from "@/components/marketing/meadow";
import { SiteHeader } from "@/components/marketing/site-header";
import { VideoList } from "@/components/marketing/video-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const plans = [
	{ name: "Starter", meta: "3 members · 5 videos · 10 GB", price: "Free" },
	{
		name: "Team",
		meta: "Unlimited members · 500 GB · version history",
		price: "$12 / member",
	},
	{
		name: "Company",
		meta: "Single sign-on · audit log · custom retention",
		price: "Contact us",
	},
];

const h2 = "text-4xl font-medium leading-[1.05] tracking-[-0.04em] sm:text-5xl";
const lead =
	"mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl";
const wrap = "mx-auto w-full max-w-[1400px] px-6 lg:px-10";

export default function Page() {
	return (
		<>
			<SiteHeader />
			<main>
				<section className={`${wrap} pt-16 text-center sm:pt-24`}>
					<h1 className="text-[clamp(2.75rem,7vw,5.5rem)] font-medium leading-[1.02] tracking-[-0.045em]">
						Video review that
						<br />
						lands on the right frame.
					</h1>
					<p className={lead}>
						Upload a video, and your team discusses it right on the timeline.
						Every comment is pinned to the second it’s about.
					</p>
					<div className="mt-10 flex flex-wrap items-center justify-center gap-4">
						<div className="px-8 py-3.5 text-lg rounded-full bg-foreground text-background">
							<Link href="#">Start a free workspace</Link>
						</div>
						<Button
							size="lg"
							variant="ghost"
							className="text-muted-foreground font-[400] text-[20px]"
						>
							<Link href="#">Read the docs</Link>
						</Button>
					</div>
				</section>

				<div className={`${wrap} mt-20 sm:mt-28`}>
					<Meadow className="px-[5%] pt-12 sm:pt-24 lg:px-[9%]">
						<VideoList />
					</Meadow>
				</div>

				<section className={`${wrap} mt-32 text-center sm:mt-44`}>
					<h2 className={h2}>
						Comment on the
						<br />
						exact second.
					</h2>
					<p className={lead}>
						Click the timeline, write your note, and everyone sees it pinned to
						that moment. No more “somewhere around the middle.”
					</p>
					<Meadow className="mt-14 p-4 text-left sm:p-10 lg:p-14">
						<AnnotationDemo />
					</Meadow>
				</section>

				<section id="pricing" className={`${wrap} mt-32 text-center sm:mt-44`}>
					<h2 className={h2}>
						Start free. Pay when your whole company is reviewing.
					</h2>
					<ul className="mx-auto mt-14 max-w-3xl overflow-hidden rounded-3xl border text-left">
						{plans.map((p) => (
							<li
								key={p.name}
								className="flex items-center justify-between gap-4 border-b px-5 py-5 last:border-b-0 sm:px-8"
							>
								<div>
									<p className="text-[17px]">{p.name}</p>
									<p className="mt-0.5 text-[15px] text-muted-foreground">
										{p.meta}
									</p>
								</div>
								<Badge
									className="px-4 py-3 rounded-full"
									variant={p.name === "Team" ? "success" : "default"}
								>
									{p.price}
								</Badge>
							</li>
						))}
					</ul>
				</section>
			</main>

			<footer
				className={`${wrap} mt-32 flex flex-wrap items-center justify-between gap-4 border-t py-8 text-[15px] text-muted-foreground`}
			>
				<span>© 2026 Anom</span>
				<nav className="flex gap-6">
					{["Docs", "Changelog", "Privacy", "Terms"].map((l) => (
						<Link
							key={l}
							href="#"
							className="transition-colors hover:text-foreground"
						>
							{l}
						</Link>
					))}
				</nav>
			</footer>
		</>
	);
}
