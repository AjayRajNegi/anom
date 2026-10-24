"use client";

import { useRef, useState } from "react";
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
	const [startSeconds, setStartSeconds] = useState<number | null>(null);
	const [endSeconds, setEndSeconds] = useState<number | null>(null);
	const [comment, setComment] = useState("");
	const [annotations, setAnnotations] = useState(initialAnnotations);
	const [activeId, setActiveId] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	function markStart() {
		setStartSeconds(currentTime);
		setError(null);
	}

	function markEnd() {
		setEndSeconds(currentTime);
		setError(null);
	}

	function addAnnotation() {
		const trimmedComment = comment.trim();

		if (startSeconds === null || endSeconds === null) {
			setError("Select both a start time and an end time.");
			return;
		}

		if (endSeconds <= startSeconds) {
			setError("The end time must be after the start time.");
			return;
		}

		if (!trimmedComment) {
			setError("Please enter a comment.");
			return;
		}

		const annotation: Annotation = {
			id: crypto.randomUUID(),
			startSeconds,
			endSeconds,
			comment: trimmedComment,
		};

		setAnnotations((current) =>
			[...current, annotation].sort((a, b) => a.startSeconds - b.startSeconds),
		);

		setActiveId(annotation.id);
		setStartSeconds(null);
		setEndSeconds(null);
		setComment("");
		setError(null);
	}

	function selectAnnotation(annotation: Annotation) {
		setActiveId(annotation.id);

		const video = videoRef.current;

		if (!video) return;

		video.currentTime = annotation.startSeconds;
		setCurrentTime(annotation.startSeconds);

		// Playback may be blocked by the browser; seeking still works.
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
							startSeconds={startSeconds}
							endSeconds={endSeconds}
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
