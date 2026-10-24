"use client";

import { formatTime } from "./video.types";

type AnnotationControlsProps = {
	currentTime: number;
	startSeconds: number | null;
	endSeconds: number | null;
	comment: string;
	error: string | null;
	onMarkStart: () => void;
	onMarkEnd: () => void;
	onCommentChange: (value: string) => void;
	onSubmit: () => void;
};

export function AnnotationControls({
	currentTime,
	startSeconds,
	endSeconds,
	comment,
	error,
	onMarkStart,
	onMarkEnd,
	onCommentChange,
	onSubmit,
}: AnnotationControlsProps) {
	const canSubmit =
		startSeconds !== null && endSeconds !== null && comment.trim().length > 0;

	const buttonClass =
		"rounded-xl border border-white/20 px-5 py-3 text-sm " +
		"transition hover:border-sky-400 hover:bg-white/5";

	return (
		<section className="space-y-3">
			<div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/20 p-4">
				<div className="mr-auto">
					<h2 className="font-medium">Select annotation range</h2>
					<p className="mt-1 text-xs text-white/50">
						Current position: {formatTime(currentTime)}
					</p>
				</div>

				<button type="button" onClick={onMarkStart} className={buttonClass}>
					<span className="block text-white/60">Start</span>
					<span className="text-sky-400">
						{startSeconds === null ? "Set start" : formatTime(startSeconds)}
					</span>
				</button>

				<button type="button" onClick={onMarkEnd} className={buttonClass}>
					<span className="block text-white/60">End</span>
					<span className="text-sky-400">
						{endSeconds === null ? "Set end" : formatTime(endSeconds)}
					</span>
				</button>
			</div>

			<div className="space-y-3 rounded-2xl border border-white/20 p-4">
				<label
					htmlFor="annotation-comment"
					className="block text-sm font-medium"
				>
					Comment
				</label>

				<textarea
					id="annotation-comment"
					value={comment}
					onChange={(event) => onCommentChange(event.currentTarget.value)}
					placeholder="What happens in this part of the video?"
					rows={3}
					className="w-full resize-y rounded-xl border border-white/15 bg-white/[0.03] p-3 text-sm outline-none placeholder:text-white/35 focus:border-sky-400"
				/>

				{error && (
					<p role="alert" className="text-sm text-red-400">
						{error}
					</p>
				)}

				<div className="flex justify-end">
					<button
						type="button"
						onClick={onSubmit}
						disabled={!canSubmit}
						className="rounded-xl bg-sky-500 px-5 py-3 text-sm font-medium text-black transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-40"
					>
						Add annotation
					</button>
				</div>
			</div>
		</section>
	);
}
