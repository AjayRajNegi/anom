"use client";

import { Badge } from "@/components/ui/badge";
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
		<aside className="flex min-h-64 flex-col rounded-lg border bg-card lg:min-h-0 transition-shadow hover:shadow-xl">
			<div className="flex items-center justify-between gap-2 border-b px-4 py-3">
				<h2 className="text-sm font-medium">Annotations</h2>
				<Badge variant="secondary" className="font-mono text-xs">
					{annotations.length}
				</Badge>
			</div>

			<div className="flex-1 space-y-1 overflow-y-auto p-2 lg:max-h-[calc(100vh-9rem)]">
				{annotations.length === 0 ? (
					<div className="flex flex-col items-center justify-center px-4 py-10 text-center">
						<p className="text-sm font-medium">No annotations yet</p>
						<p className="mt-1 max-w-56 text-sm text-muted-foreground">
							Set a time range and add a comment to start a discussion.
						</p>
					</div>
				) : (
					annotations.map((annotation) => {
						const isActive = annotation.id === activeId;

						return (
							<button
								key={annotation.id}
								type="button"
								onClick={() => onSelect(annotation)}
								aria-pressed={isActive}
								className={`w-full rounded-md border px-3 py-3 text-left transition-colors ${
									isActive
										? "border-primary/30 bg-accent"
										: "border-transparent hover:bg-muted/50"
								}`}
							>
								<span className="block font-mono text-xs text-muted-foreground">
									{formatRange(annotation)}
								</span>

								<span className="mt-1.5 block whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground">
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
