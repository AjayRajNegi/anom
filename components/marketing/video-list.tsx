"use client";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Status = "approved" | "comments" | "reviewing";
const videos: {
	who: string;
	title: string;
	team: string;
	length: string;
	ago: string;
	status: Status;
	label: string;
}[] = [
	{
		who: "AK",
		title: "Onboarding walkthrough v3",
		team: "product",
		length: "3:18",
		ago: "2h ago",
		status: "approved",
		label: "Approved",
	},
	{
		who: "JM",
		title: "Q4 all-hands recording",
		team: "people",
		length: "48:02",
		ago: "3h ago",
		status: "comments",
		label: "3 comments",
	},
	{
		who: "SR",
		title: "Customer interview: Priya",
		team: "research",
		length: "27:40",
		ago: "5h ago",
		status: "reviewing",
		label: "Reviewing",
	},
	{
		who: "AK",
		title: "Checkout flow demo",
		team: "product",
		length: "1:52",
		ago: "1d ago",
		status: "comments",
		label: "1 comment",
	},
	{
		who: "LT",
		title: "Brand film rough cut",
		team: "marketing",
		length: "2:30",
		ago: "1d ago",
		status: "approved",
		label: "Approved",
	},
	{
		who: "JM",
		title: "Safety training, module 2",
		team: "operations",
		length: "12:15",
		ago: "2d ago",
		status: "comments",
		label: "2 comments",
	},
];

export function VideoList() {
	const [tab, setTab] = useState("open");
	const [query, setQuery] = useState("");

	const rows = videos.filter(
		(v) =>
			(tab === "open" || (tab === "approved" && v.status === "approved")) &&
			v.title.toLowerCase().includes(query.toLowerCase()),
	);

	return (
		<div className="rounded-t-3xl bg-white shadow-[0_1px_2px_rgba(0,0,0,.04)]">
			<div className="flex flex-wrap items-center gap-x-4 gap-y-3 px-5 py-5 sm:px-8">
				<h3 className="text-lg font-medium">Videos</h3>
				<Tabs value={tab} onValueChange={setTab}>
					<TabsList>
						<TabsTrigger value="open">Open 12</TabsTrigger>
						<TabsTrigger value="approved">Approved</TabsTrigger>
						<TabsTrigger value="archived">Archived</TabsTrigger>
					</TabsList>
				</Tabs>
				<Input
					aria-label="Search videos"
					placeholder="Search videos"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					className="ml-auto h-12 w-full sm:w-80"
				/>
			</div>
			<ul className="border-t">
				{rows.map((v) => (
					<li
						key={v.title}
						className="flex items-center gap-5 border-b px-5 py-4 last:border-b-0 sm:px-8 sm:py-5"
					>
						<Avatar className="size-[52px]">
							<AvatarFallback>{v.who}</AvatarFallback>
						</Avatar>
						<div className="min-w-0 flex-1">
							<p className="truncate text-[17px]">{v.title}</p>
							<p className="mt-0.5 text-[15px] text-muted-foreground">
								{v.team} · {v.length} · {v.ago}
							</p>
						</div>
						<Badge
							variant={
								v.status === "approved"
									? "success"
									: v.status === "comments"
										? "default"
										: "outline"
							}
						>
							{v.label}
						</Badge>
					</li>
				))}
				{rows.length === 0 && (
					<li className="px-8 py-10 text-[15px] text-muted-foreground">
						{tab === "archived"
							? "Nothing archived yet."
							: "No videos match that search."}
					</li>
				)}
			</ul>
		</div>
	);
}
