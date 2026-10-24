"use client";

import type { RefObject } from "react";

type VideoPlayerProps = {
	src: string;
	videoRef: RefObject<HTMLVideoElement | null>;
	onTimeUpdate: (seconds: number) => void;
};

export function VideoPlayer({ src, videoRef, onTimeUpdate }: VideoPlayerProps) {
	return (
		<section
			aria-label="Video player"
			className="overflow-hidden rounded-2xl border border-border bg-black"
		>
			{/** biome-ignore lint/a11y/useMediaCaption: <explanation> */}
			<video
				ref={videoRef}
				src={src}
				controls
				playsInline
				preload="metadata"
				onTimeUpdate={(event) => onTimeUpdate(event.currentTarget.currentTime)}
				className="aspect-video w-full object-contain"
			>
				Your browser does not support video playback.
			</video>
		</section>
	);
}