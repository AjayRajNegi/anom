import { VideoWorkspace } from "@/components/video/video-workspace";
import { getVideoAnnotations } from "@/lib/actions/annotation/get-annotations";
import { getVideoPlaybackUrl } from "@/lib/actions/video";
import { requireUser } from "@/lib/dal";

type VideoPageProps = {
	params: Promise<{ videoId: string }>;
};

export default async function VideoPage({ params }: VideoPageProps) {
	const user = await requireUser();

	const { videoId } = await params;
	const result = await getVideoPlaybackUrl({ videoId });
	const annotationResult = await getVideoAnnotations({ videoId });

	const initialAnnotations = annotationResult.success
		? annotationResult.annotations
		: [];

	if (result.success === false) {
		return (
			<main className="grid min-h-screen place-items-center bg-background p-6 text-foreground">
				<div className="max-w-md text-center">
					<h1 className="text-2xl font-semibold">Unable to load video</h1>
					<p className="mt-3 text-sm text-muted-foreground">
						{result.error ?? "Something went wrong. Please try again."}
					</p>
				</div>
			</main>
		);
	}

	return (
		<VideoWorkspace
			userId={user.id}
			videoId={videoId}
			playbackUrl={result.playbackUrl}
			initialAnnotations={initialAnnotations}
		/>
	);
}
