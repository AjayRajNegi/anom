"use client";

import { type Annotation, formatRange } from "./video.types";

type AnnotationListProps = {
	annotations: Annotation[];
	activeId: string | null;
	onSelect: (annotation: Annotation) => void;
};

export function AnnotationList({
	annotations,
	activeId,
	onSelect,
}: AnnotationListProps) {
	return (
		<aside className="flex min-h-64 flex-col rounded-2xl border border-border p-4 lg:min-h-0">
			<div className="mb-4 flex items-center justify-between gap-2">
				<h2 className="text-lg font-semibold">All annotations</h2>
				<span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
					{annotations.length}
				</span>
			</div>

			<div className="space-y-3 overflow-y-auto lg:max-h-[calc(100vh-9rem)]">
				{annotations.length === 0 ? (
					<p className="rounded-xl border border-dashed border-border p-4 text-sm leading-6 text-muted-foreground">
						No annotations yet. Set a start and end time, then add your first
						comment.
					</p>
				) : (
					annotations.map((annotation) => {
						const isActive = annotation.id === activeId;

						return (
							<button
								key={annotation.id}
								type="button"
								onClick={() => onSelect(annotation)}
								aria-pressed={isActive}
								className={`w-full rounded-xl border p-3 text-left transition ${
									isActive
										? "border-primary bg-primary/10"
										: "border-border hover:border-border/50"
								}`}
							>
								<span className="block text-sm font-medium text-primary">
									{formatRange(annotation)}
								</span>

								<span className="mt-2 block whitespace-pre-wrap break-words text-sm leading-6 text-foreground/80">
									{annotation.body}
								</span>
							</button>
						);
					})
				)}
			</div>
		</aside>
	);
}