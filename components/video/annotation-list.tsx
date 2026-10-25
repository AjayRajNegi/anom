/** biome-ignore-all lint/a11y/useKeyWithClickEvents: suppress */
"use client";

import { EllipsisVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { deleteAnnotation } from "@/lib/actions/annotation/delete-annotation";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "../ui/menu";
import { toastManager } from "../ui/toast";
import { type Annotation, formatRange } from "./video.types";

type AnnotationListProps = {
	userId: string;
	annotations: Annotation[];
	activeId: string | null;
	onSelect: (annotation: Annotation) => void;
	setAnnotations: (annotations: Annotation[]) => void;
};

export function AnnotationList({
	userId,
	annotations,
	activeId,
	onSelect,
	setAnnotations,
}: AnnotationListProps) {
	const updateAnnotationList = async (id: string) => {
		const res = await deleteAnnotation({ annotationId: id });

		if (!res.success) {
			toastManager.add({ title: "Couldn't delete annotation", type: "error" });
			return;
		}

		const updatedAnnotation = annotations.filter(
			(annotation) => annotation.id !== id,
		);
		setAnnotations(updatedAnnotation);
		toastManager.add({ title: "Annotation deleted" });
	};
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
							<div
								key={annotation.id}
								className={`flex w-full items-start gap-2 rounded-md border px-3 py-3 transition-colors ${
									isActive
										? "border-primary/30 bg-accent"
										: "border-transparent hover:bg-muted/50"
								}`}
							>
								<button
									type="button"
									onClick={() => onSelect(annotation)}
									aria-pressed={isActive}
									className="flex min-w-0 flex-1 items-start text-left"
								>
									<div className="min-w-0 flex-1">
										<div className="flex items-center gap-2">
											<Avatar className="h-8 w-8 shrink-0 rounded-lg">
												<AvatarFallback className="rounded-lg">
													AN
												</AvatarFallback>
											</Avatar>

											<span className="block font-mono text-xs text-muted-foreground">
												{formatRange(annotation)}
											</span>
										</div>

										<span className="mt-1.5 block whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground">
											{annotation.body}
										</span>
									</div>
								</button>

								{/** biome-ignore lint/a11y/noStaticElementInteractions: suppress */}
								<div onClick={(event) => event.stopPropagation()}>
									<DropdownMenu>
										<DropdownMenuTrigger
											aria-label="Annotation options"
											className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
										>
											<EllipsisVertical className="size-4" />
										</DropdownMenuTrigger>

										<DropdownMenuContent align="end">
											<DropdownMenuGroup>
												<DropdownMenuItem
													disabled={userId !== annotation.authorId}
													className="text-destructive focus:text-destructive"
													onClick={() => {
														void updateAnnotationList(annotation.id);
													}}
												>
													Delete
												</DropdownMenuItem>
											</DropdownMenuGroup>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
							</div>
						);
					})
				)}
			</div>
		</aside>
	);
}
