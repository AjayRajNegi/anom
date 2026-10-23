import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { listMembers } from "@/lib/actions/org/list-members";
import { requireMembership } from "@/lib/dal";
import { VideoGrid } from "./catalog/video-grid";
import { getVideos } from "./catalog/video-list";

export default async function OrgPage() {
	await requireMembership();
	const { videos, nextCursor, hasMore } = await getVideos();
	const { user } = await listMembers();

	console.log(videos);
	return (
		<div className="container mx-auto px-4 py-8">
			<div className="flex items-center justify-between mb-8">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
					<p className="text-muted-foreground mt-1">
						Recent videos in your organization
					</p>
				</div>
				<a
					href="/anom-org/upload"
					className="hidden sm:inline-flex items-center gap-2"
				>
					{/** biome-ignore lint/a11y/noSvgWithoutTitle: suppress */}
					<svg
						className="h-5 w-5"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
						<polyline points="17 8 12 3 7 8" />
						<line x1="12" y1="3" x2="12" y2="15" />
					</svg>
					Upload Video
				</a>
			</div>

			<div className="flex flex-col lg:flex-row gap-4">
				<Card className="w-full lg:w-[35%] h-fit">
					<CardHeader>Members</CardHeader>
					<CardContent className="space-y-3">
						{user?.map((user) => (
							<div
								key={user.user.email}
								className="flex items-center gap-2 p-1 transition-colors hover:bg-muted/50 border-b rounded-bl-xl rounded-none"
							>
								<Avatar className="h-8 w-8 rounded-lg grayscale">
									<AvatarImage
										src={user.user.image ? user.user.image : ""}
										alt={user.user.name}
									/>
									<AvatarFallback className="rounded-lg">
										{user.user.name[0]}
									</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium">{user.user.name}</span>
									<span className="truncate text-xs text-muted-foreground">
										{user.user.email}
									</span>
								</div>
							</div>
						))}
					</CardContent>
				</Card>
				<VideoGrid
					initialVideos={videos}
					initialCursor={nextCursor}
					initialHasMore={hasMore}
				/>
			</div>
		</div>
	);
}
