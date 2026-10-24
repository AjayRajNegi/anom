"use client";

import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
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

	return (
		<section className="space-y-4">
			{/* Timestamp selection */}
			<div className="rounded-lg border bg-card  transition-shadow hover:shadow-xl">
				<div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
					<div>
						<h2 className="text-sm font-medium">Annotation range</h2>
						<p className="text-xs text-muted-foreground">
							Current position: {formatTime(currentTime * 1000)}
						</p>
					</div>
				</div>

				<div className="grid grid-cols-2 gap-3 p-3">
					<Button
						type="button"
						variant="outline"
						onClick={onMarkStart}
						className="h-auto justify-between gap-3 px-3 py-2.5"
					>
						<span className="text-sm font-normal text-muted-foreground">
							Start
						</span>
						<span className="font-mono text-xs">
							{startMs === null ? "Set time" : formatTime(startMs * 1000)}
						</span>
					</Button>

					<Button
						type="button"
						variant="outline"
						onClick={onMarkEnd}
						className="h-auto justify-between gap-3 px-3 py-2.5"
					>
						<span className="text-sm font-normal text-muted-foreground">
							End
						</span>
						<span className="font-mono text-xs">
							{endMs === null ? "Set time" : formatTime(endMs * 1000)}
						</span>
					</Button>
				</div>
			</div>

			{/* Comment */}
			<div className="space-y-3 rounded-lg border bg-card p-4  transition-shadow hover:shadow-xl">
				<div className="space-y-1.5">
					<Label htmlFor="annotation-comment">Comment</Label>
					<Textarea
						id="annotation-comment"
						value={comment}
						onChange={(event) => onCommentChange(event.currentTarget.value)}
						placeholder="What happens in this part of the video?"
						rows={3}
						aria-invalid={!!error}
						aria-describedby={error ? "annotation-error" : undefined}
						className="resize-y"
					/>

					{error && (
						<p
							id="annotation-error"
							role="alert"
							className="text-sm text-destructive"
						>
							{error}
						</p>
					)}
				</div>

				<div className="flex justify-end">
					<Button type="button" onClick={onSubmit} disabled={!canSubmit}>
						Add annotation
					</Button>
				</div>
			</div>
		</section>
	);
}
