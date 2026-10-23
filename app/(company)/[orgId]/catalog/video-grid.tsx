"use client";

import { formatDistanceToNow } from "date-fns";
import {
	AlertCircle,
	Clock,
	Loader2,
	MessageSquare,
	User,
	Video,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import type { ListVideosResult, VideoListItem } from "./video-list";

interface VideoGridProps {
	initialVideos: VideoListItem[];
	initialCursor: string | null;
	initialHasMore: boolean;
}

function formatDuration(ms: number | null): string {
	if (!ms) return "Unknown duration";
	const totalSeconds = Math.floor(ms / 1000);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;

	if (hours > 0) {
		return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
	}
	return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function VideoCard({ video }: { video: VideoListItem }) {
	const isUploading = video.status === "UPLOADING";
	const isFailed = video.status === "FAILED";
	const isReady = video.status === "READY";

	return (
		<Card className="flex flex-col h-full transition-shadow hover:shadow-lg w-full">
			<CardHeader className="pb-2">
				<div className="flex items-start justify-between gap-2">
					<CardTitle className="text-lg truncate flex-1">
						{video.title}
					</CardTitle>
					<div className="flex items-center gap-1.5">
						{isUploading && (
							<Badge variant="secondary" className="gap-1">
								<Loader2 className="h-3 w-3 animate-spin" />
								Uploading
							</Badge>
						)}
						{isFailed && (
							<Badge variant="destructive" className="gap-1">
								<AlertCircle className="h-3 w-3" />
								Failed
							</Badge>
						)}
						{isReady && <Badge variant="outline">Ready</Badge>}
					</div>
				</div>
				{video.description && (
					<p className="text-sm text-muted-foreground line-clamp-2 mt-1">
						{video.description}
					</p>
				)}
			</CardHeader>
			<CardContent className="flex-1 flex flex-col">
				<div className="flex flex-col gap-1 text-sm text-muted-foreground mb-3">
					<div className="flex items-center gap-1.5">
						<User className="h-4 w-4" />
						<span>{video.uploader.name}</span>
					</div>

					<div className="flex justify-between">
						<div className="flex items-center gap-1.5">
							<MessageSquare className="h-4 w-4" />
							<span>{video.annotationCount} annotations</span>
						</div>

						<div className="flex gap-1.5 items-center">
							<Clock className="h-4 w-4" />
							<span>
								{formatDistanceToNow(new Date(video.createdAt), {
									addSuffix: true,
								})}
							</span>
						</div>
					</div>
				</div>
				<div className="mt-auto pt-3 border-t flex items-center justify-between">
					<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
						<Video className="h-4 w-4" />
						<span>{formatDuration(video.durationMs)}</span>
					</div>

					{isReady && (
						<Link
							href={`/anom-org/catalog/${video.id}`}
							className="text-sm font-medium text-primary hover:underline"
						>
							Watch →
						</Link>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

function VideoSkeleton() {
	return (
		<Card className="flex flex-col h-full">
			<CardHeader className="pb-2">
				<Skeleton className="h-6 w-3/4" />
				<Skeleton className="h-4 w-1/2 mt-2" />
			</CardHeader>
			<CardContent className="flex-1 flex flex-col">
				<div className="flex items-center gap-4 mb-3">
					<Skeleton className="h-4 w-24" />
					<Skeleton className="h-4 w-24" />
					<Skeleton className="h-4 w-24" />
					<Skeleton className="h-4 w-24" />
				</div>
				<div className="mt-auto pt-3 border-t">
					<Skeleton className="h-4 w-20" />
				</div>
			</CardContent>
		</Card>
	);
}

export function VideoGrid({
	initialVideos,
	initialCursor,
	initialHasMore,
}: VideoGridProps) {
	const [videos, setVideos] = useState<VideoListItem[]>(initialVideos);
	const [cursor, setCursor] = useState<string | null>(initialCursor);
	const [hasMore, setHasMore] = useState(initialHasMore);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const loadMore = useCallback(async () => {
		if (isLoadingMore || !hasMore || !cursor) return;

		setIsLoadingMore(true);
		setError(null);

		try {
			const response = await fetch(`/api/videos?cursor=${cursor}`);
			if (!response.ok) {
				throw new Error("Failed to load more videos");
			}
			const data: ListVideosResult = await response.json();

			setVideos((prev) => [...prev, ...data.videos]);
			setCursor(data.nextCursor);
			setHasMore(data.hasMore);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to load more videos",
			);
		} finally {
			setIsLoadingMore(false);
		}
	}, [cursor, hasMore, isLoadingMore]);

	if (videos.length === 0 && !isLoadingMore) {
		return (
			<Empty className="py-16">
				<EmptyMedia variant="icon">
					<Video className="h-12 w-12 text-muted-foreground/50" />
				</EmptyMedia>
				<EmptyHeader>
					<EmptyTitle>No videos yet</EmptyTitle>
					<EmptyDescription>
						Get started by uploading your first video for review.
					</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<a
						href="/anom-org/upload"
						className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
					>
						<Video className="h-4 w-4" />
						Upload Video
					</a>
				</EmptyContent>
			</Empty>
		);
	}

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ">
				{videos.map((video) => (
					<article key={video.id}>
						<VideoCard video={video} />
					</article>
				))}
				{isLoadingMore && (
					<div
						className="col-span-full"
						role="status"
						aria-label="Loading more videos"
					>
						<VideoSkeleton />
						<VideoSkeleton />
						<VideoSkeleton />
					</div>
				)}
			</div>

			{hasMore && (
				<div className="text-center">
					<Button
						variant="outline"
						size="lg"
						onClick={loadMore}
						disabled={isLoadingMore}
						className="w-full sm:w-auto min-w-[200px]"
					>
						{isLoadingMore ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Loading...
							</>
						) : (
							"Load More"
						)}
					</Button>
					{error && (
						<p className="mt-2 text-sm text-red-500" role="alert">
							{error}
						</p>
					)}
				</div>
			)}

			{!hasMore && videos.length > 0 && (
				<p className="text-center text-sm text-muted-foreground">
					End of catalog
				</p>
			)}
		</div>
	);
}
