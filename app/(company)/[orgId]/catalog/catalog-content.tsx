import { VideoGrid } from "./video-grid";
import { getVideos } from "./video-list";

export async function CatalogContent() {
	const { videos, nextCursor, hasMore } = await getVideos();

	return (
		<div className="container mx-auto px-4 border mt-32 py-8 rounded-2xl">
			<div className="flex items-center justify-between mb-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Video Catalog</h1>
					<p className="text-muted-foreground mt-1">
						All videos in your organization
					</p>
				</div>
				<a
					href="/anom-org/upload"
					className="hidden sm:inline-flex items-center gap-2"
				>
					{/** biome-ignore lint/a11y/noSvgWithoutTitle: supress */}
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
