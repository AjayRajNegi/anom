import { VideoWorkspace } from "@/components/video/video-workspace";
import { getVideoAnnotations } from "@/lib/actions/annotation/get-annotations";
import { getVideoPlaybackUrl } from "@/lib/actions/video";

type VideoPageProps = {
	params: Promise<{ videoId: string }>;
};

export default async function VideoPage({ params }: VideoPageProps) {
	const { videoId } = await params;
	const result = await getVideoPlaybackUrl({ videoId });

	const annotationResult = await getVideoAnnotations({ videoId });

	const initialAnnotations = annotationResult.success
		? annotationResult.annotations
		: [];

	if (result.success === false) {
		return (
			<main className="grid min-h-screen place-items-center bg-[#111] p-6 text-white">
				<div className="max-w-md text-center">
					<h1 className="text-2xl font-semibold">Unable to load video</h1>
					<p className="mt-3 text-sm text-white/60">
						{result.error ?? "Something went wrong. Please try again."}
					</p>
				</div>
			</main>
		);
	}

	return (
		<VideoWorkspace
			videoId={videoId}
			playbackUrl={result.playbackUrl}
			initialAnnotations={initialAnnotations}
		/>
	);
}
