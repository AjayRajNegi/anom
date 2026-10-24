"use client";

import { formatTime } from "./video.types";

type AnnotationControlsProps = {
	currentTime: number;
	startMs: number | null;
	endMs: number | null;
	comment: string;
	error: string | null;
	onMarkStart: () => void;
	onMarkEnd: () => void;
	onCommentChange: (value: string) => void;
	onSubmit: () => void;
};

export function AnnotationControls({
	currentTime,
	startMs,
	endMs,
	comment,
	error,
	onMarkStart,
	onMarkEnd,
	onCommentChange,
	onSubmit,
}: AnnotationControlsProps) {
	const canSubmit =
		startMs !== null && endMs !== null && comment.trim().length > 0;

	const buttonClass =
		"rounded-xl border border-border px-5 py-3 text-sm " +
		"transition hover:border-primary hover:bg-accent";

	return (
		<section className="space-y-3">
			<div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border p-4">
				<div className="mr-auto">
					<h2 className="font-medium">Select annotation range</h2>
					<p className="mt-1 text-xs text-muted-foreground">
						Current position: {formatTime(currentTime * 1000)}
					</p>
				</div>

				<button type="button" onClick={onMarkStart} className={buttonClass}>
					<span className="block text-muted-foreground">Start</span>
					<span className="text-primary">
						{startMs === null ? "Set start" : formatTime(startMs * 1000)}
					</span>
				</button>

				<button type="button" onClick={onMarkEnd} className={buttonClass}>
					<span className="block text-muted-foreground">End</span>
					<span className="text-primary">
						{endMs === null ? "Set end" : formatTime(endMs * 1000)}
					</span>
				</button>
			</div>

			<div className="space-y-3 rounded-2xl border border-border p-4">
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
					className="w-full resize-y rounded-xl border border-input bg-background p-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring"
				/>

				{error && (
					<p role="alert" className="text-sm text-destructive">
						{error}
					</p>
				)}

				<div className="flex justify-end">
					<button
						type="button"
						onClick={onSubmit}
						disabled={!canSubmit}
						className="rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
					>
						Add annotation
					</button>
				</div>
			</div>
		</section>
	);
}
