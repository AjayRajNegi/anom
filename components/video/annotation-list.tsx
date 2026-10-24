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
		<aside className="flex min-h-64 flex-col rounded-2xl border border-white/20 p-4 lg:min-h-0">
			<div className="mb-4 flex items-center justify-between gap-2">
				<h2 className="text-lg font-semibold">All annotations</h2>
				<span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/70">
					{annotations.length}
				</span>
			</div>

			<div className="space-y-3 overflow-y-auto lg:max-h-[calc(100vh-9rem)]">
				{annotations.length === 0 ? (
					<p className="rounded-xl border border-dashed border-white/20 p-4 text-sm leading-6 text-white/50">
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
										? "border-sky-400 bg-sky-400/10"
										: "border-white/15 hover:border-white/35"
								}`}
							>
								<span className="block text-sm font-medium text-sky-400">
									{formatRange(annotation)}
								</span>

								<span className="mt-2 block whitespace-pre-wrap break-words text-sm leading-6 text-white/80">
									{annotation.comment}
								</span>
							</button>
						);
					})
				)}
			</div>
		</aside>
	);
}
