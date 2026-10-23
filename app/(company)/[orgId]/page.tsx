import { requireMembership } from "@/lib/dal";
import { VideoGrid } from "./catalog/video-grid";
import { getVideos } from "./catalog/video-list";

export default async function OrgPage() {
	await requireMembership();
	const { videos, nextCursor, hasMore } = await getVideos();

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

			<VideoGrid
				initialVideos={videos}
				initialCursor={nextCursor}
				initialHasMore={hasMore}
			/>
		</div>
	);
}
