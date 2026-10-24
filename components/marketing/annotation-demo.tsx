"use client";
import { Play } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const DURATION = 198;
const fmt = (s: number) =>
	`${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

type Comment = {
	id: number;
	who: string;
	name: string;
	t: number;
	text: string;
};
const seed: Comment[] = [
	{
		id: 1,
		who: "AK",
		name: "Asha K.",
		t: 12,
		text: "Logo sits too close to the edge here. Can we add margin before the fade?",
	},
	{
		id: 2,
		who: "JM",
		name: "Jon M.",
		t: 42,
		text: "The voiceover says “invite teammates” while the screen still shows settings.",
	},
	{
		id: 3,
		who: "SR",
		name: "Sam R.",
		t: 96,
		text: "Love this transition. Keep it in the final cut.",
	},
	{
		id: 4,
		who: "LT",
		name: "Lena T.",
		t: 141,
		text: "The caption is cut off in the vertical export.",
	},
];

export function AnnotationDemo() {
	const [comments, setComments] = useState(seed);
	const [activeId, setActiveId] = useState(2);
	const [draft, setDraft] = useState("");
	const active = comments.find((c) => c.id === activeId) ?? comments[0];

	function post(e: FormEvent) {
		e.preventDefault();
		const text = draft.trim();
		if (!text) return;
		const next: Comment = {
			id: Date.now(),
			who: "YO",
			name: "You",
			t: active.t,
			text,
		};
		setComments((cs) => [...cs, next].sort((a, b) => a.t - b.t));
		setActiveId(next.id);
		setDraft("");
	}

	return (
		<div className="grid overflow-hidden rounded-3xl bg-white lg:grid-cols-[1.5fr_1fr]">
			<div className="p-5 sm:p-8">
				<div className="relative aspect-video overflow-hidden rounded-2xl bg-gradient-to-br from-[#efe6d0] to-[#c9b387]">
					{/** biome-ignore lint/a11y/useButtonType: suppress */}
					<button
						aria-label="Play video"
						className="absolute inset-0 m-auto grid size-16 place-items-center rounded-full bg-white/90 transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					>
						<Play className="size-6 translate-x-0.5 fill-foreground" />
					</button>
					<span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3.5 py-1 text-sm tabular-nums">
						{fmt(active.t)} / {fmt(DURATION)}
					</span>
				</div>

				<div className="relative mb-4 mt-10 h-1.5 rounded-full bg-muted">
					<div
						className="absolute inset-y-0 left-0 rounded-full bg-foreground"
						style={{ width: `${(active.t / DURATION) * 100}%` }}
					/>
					{comments.map((c) => (
						// biome-ignore lint/a11y/useButtonType: suppress
						<button
							key={c.id}
							onClick={() => setActiveId(c.id)}
							aria-pressed={c.id === activeId}
							aria-label={`${c.name} at ${fmt(c.t)}`}
							style={{ left: `${(c.t / DURATION) * 100}%` }}
							className={cn(
								"absolute top-1/2 grid size-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
								c.id === activeId
									? "bg-foreground text-primary-foreground"
									: "bg-muted text-muted-foreground hover:text-foreground",
							)}
						>
							{c.who}
						</button>
					))}
				</div>
			</div>

			<div className="flex flex-col border-t lg:border-l lg:border-t-0">
				<div className="px-5 py-5 sm:px-8">
					<p className="text-[17px]">Onboarding walkthrough v3</p>
					<p className="mt-0.5 text-[15px] text-muted-foreground">
						product · {comments.length} comments
					</p>
				</div>
				<ul className="max-h-[22rem] flex-1 overflow-y-auto border-t">
					{comments.map((c) => (
						<li key={c.id} className="border-b last:border-b-0">
							{/** biome-ignore lint/a11y/useButtonType: suppress */}
							<button
								onClick={() => setActiveId(c.id)}
								className={cn(
									"flex w-full gap-4 px-5 py-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-8",
									c.id === activeId ? "bg-muted/60" : "hover:bg-muted/30",
								)}
							>
								<Avatar className="size-10">
									<AvatarFallback className="text-xs">{c.who}</AvatarFallback>
								</Avatar>
								<span className="min-w-0 flex-1">
									<span className="flex items-center gap-2">
										<span className="text-[15px] font-medium">{c.name}</span>
										<Badge
											variant="outline"
											className="px-2.5 py-0.5 text-[13px] tabular-nums"
										>
											{fmt(c.t)}
										</Badge>
									</span>
									<span className="mt-1 block text-[15px] leading-snug text-muted-foreground">
										{c.text}
									</span>
								</span>
							</button>
						</li>
					))}
				</ul>
				<form onSubmit={post} className="flex gap-2 border-t px-5 py-4 sm:px-8">
					<Input
						aria-label="Add a comment"
						placeholder={`Comment at ${fmt(active.t)}`}
						value={draft}
						onChange={(e) => setDraft(e.target.value)}
					/>
					<Button type="submit" className="h-11">
						Post
					</Button>
				</form>
			</div>
		</div>
	);
}
