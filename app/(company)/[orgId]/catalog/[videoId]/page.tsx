"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getVideoPlaybackUrl } from "@/lib/actions/video";

export default function VideoPage() {
	const { videoId } = useParams<{ videoId: string }>();

	const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;

		async function loadVideo() {
			try {
				const result = await getVideoPlaybackUrl({ videoId });

				if (cancelled) return;

				if (!result.success) {
					setError(result.error || "Unable to load video.");
					return;
				}
				if (!result.playbackUrl) {
					setError("Unable to load video.");
					return;
				}

				setPlaybackUrl(result.playbackUrl);
			} catch {
				if (!cancelled) {
					setError("Something went wrong while loading the video.");
				}
			} finally {
				if (!cancelled) {
					setLoading(false);
				}
			}
		}

		void loadVideo();

		return () => {
			cancelled = true;
		};
	}, [videoId]);

	if (loading) {
		return <main className="p-8 text-center">Loading video...</main>;
	}

	if (error) {
		return (
			<main className="p-8 text-center">
				<h1 className="text-xl font-semibold">Unable to play video</h1>
				<p className="mt-2 text-red-500">{error}</p>
			</main>
		);
	}

	return (
		<main className="flex min-h-screen w-full items-center justify-center bg-black p-6">
			{playbackUrl && (
				// biome-ignore lint/a11y/useMediaCaption: suppress
				<video
					className="w-full max-w-5xl rounded-lg"
					src={playbackUrl}
					controls
					autoPlay
					playsInline
				/>
			)}
		</main>
	);
}
