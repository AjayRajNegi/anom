"use client";

import { useRef, useState } from "react";
import { createAnnotation } from "@/lib/actions/annotation/create-annotation";
import { AnnotationControls } from "./annotation-controls";
import { AnnotationList } from "./annotation-list";
import type { Annotation } from "./video.types";
import { VideoPlayer } from "./video-player";

type VideoWorkspaceProps = {
	videoId: string;
	playbackUrl: string;
	initialAnnotations: Annotation[];
};

export function VideoWorkspace({
	videoId,
	playbackUrl,
	initialAnnotations,
}: VideoWorkspaceProps) {
	const videoRef = useRef<HTMLVideoElement>(null);

	const [currentTime, setCurrentTime] = useState(0);
	const [startMs, setStartMs] = useState<number | null>(null);
	const [endMs, setEndMs] = useState<number | null>(null);
	const [comment, setComment] = useState("");
	const [annotations, setAnnotations] = useState(initialAnnotations);
	const [activeId, setActiveId] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	function markStart() {
		setStartMs(currentTime);
		setError(null);
	}

	function markEnd() {
		setEndMs(currentTime);
		setError(null);
	}

	async function addAnnotation() {
		const trimmedComment = comment.trim();

		if (startMs === null || endMs === null) {
			setError("Select both a start time and an end time.");
			return;
		}

		if (endMs <= startMs) {
			setError("The end time must be after the start time.");
			return;
		}

		if (!trimmedComment) {
			setError("Please enter a comment.");
			return;
		}

		const annotation: Annotation = {
			id: crypto.randomUUID(),
			startMs,
			endMs,
			body: trimmedComment,
		};

		console.log(annotation);

		const response = await createAnnotation({
			videoId,
			startMs: Math.round(startMs * 1000),
			endMs: Math.round(endMs * 1000),
			body: comment.trim(),
		});

		if (response.success === false) {
			setError(response.error);
			return;
		}

		setActiveId(annotation.id);
		setStartMs(null);
		setEndMs(null);
		setComment("");
		setError(null);
	}

	function selectAnnotation(annotation: Annotation) {
		setActiveId(annotation.id);

		const video = videoRef.current;

		if (!video) return;

		video.currentTime = annotation.startMs;
		setCurrentTime(annotation.startMs);

		void video.play().catch(() => {});
	}

	return (
		<main
			aria-label={`Video workspace for ${videoId}`}
			className="min-h-screen bg-[#111111] p-3 text-[#e8e8e8] sm:p-6"
		>
			<div className="mx-auto w-full max-w-[1600px] rounded-3xl border border-white/20 p-3 sm:p-5">
				<div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
					<div className="min-w-0 space-y-4">
						<VideoPlayer
							src={playbackUrl}
							videoRef={videoRef}
							onTimeUpdate={setCurrentTime}
						/>

						<AnnotationControls
							currentTime={currentTime}
							startMs={startMs}
							endMs={endMs}
							comment={comment}
							error={error}
							onMarkStart={markStart}
							onMarkEnd={markEnd}
							onCommentChange={setComment}
							onSubmit={addAnnotation}
						/>
					</div>

					<AnnotationList
						annotations={annotations}
						activeId={activeId}
						onSelect={selectAnnotation}
					/>
				</div>
			</div>
		</main>
	);
}
