"use client";

import { CheckCircle, FileVideo, Upload, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { toastManager } from "@/components/ui/toast";
import { createVideo, verifyVideoUpload } from "@/lib/actions/video";
import {
	MAX_VIDEO_SIZE_BYTES,
	VIDEO_MIME_TYPES,
} from "@/lib/storage/constants";

const ALLOWED_TYPES = VIDEO_MIME_TYPES;
const MAX_SIZE = MAX_VIDEO_SIZE_BYTES;

type UploadStage =
	| "idle"
	| "creating"
	| "uploading"
	| "verifying"
	| "complete"
	| "error";

interface UploadState {
	stage: UploadStage;
	progress: number;
	videoId?: string;
	error?: string;
	file?: File;
}

export default function UploadPage() {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [uploadState, setUploadState] = useState<UploadState>({
		stage: "idle",
		progress: 0,
	});
	const fileInputRef = useRef<HTMLInputElement>(null);

	const reset = useCallback(() => {
		setUploadState({ stage: "idle", progress: 0 });
		setTitle("");
		setDescription("");
	}, []);

	const handleFileSelect = useCallback((file: File) => {
		if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
			toastManager.add({
				title: `Unsupported file type. Allowed: ${ALLOWED_TYPES.join(", ")}`,
				type: "error",
			});
			return;
		}
		if (file.size > MAX_SIZE) {
			toastManager.add({
				title: `File too large. Max size: ${(MAX_SIZE / 1024 / 1024 / 1024).toFixed(1)} GB`,
				type: "error",
			});
			return;
		}
		setUploadState((s) => ({
			...s,
			file,
			stage: "idle",
			error: undefined,
			progress: 0,
		}));
	}, []);

	const handleUpload = useCallback(async () => {
		const file = uploadState.file;
		if (!file) {
			toastManager.add({ title: "Please select a file first", type: "error" });
			return;
		}
		if (!title.trim()) {
			toastManager.add({ title: "Please enter a title", type: "error" });
			return;
		}

		setUploadState((s) => ({
			...s,
			stage: "creating",
			progress: 0,
			error: undefined,
		}));

		try {
			const createResult = await createVideo({
				title: title.trim(),
				description: description.trim() || undefined,
				mimeType: file.type,
				sizeBytes: file.size,
			});

			if (!createResult.success) {
				throw new Error(createResult.error || "Failed to create video record");
			}

			const { videoId, uploadUrl, headers } = createResult;

			setUploadState((s) => ({
				...s,
				stage: "uploading",
				videoId,
				progress: 0,
			}));

			const uploadResponse = await fetch(uploadUrl, {
				method: "PUT",
				headers: {
					"Content-Type": headers["Content-Type"],
				},
				body: file,
			});

			if (!uploadResponse.ok) {
				const errText = await uploadResponse.text();
				throw new Error(`Upload failed: ${uploadResponse.status} ${errText}`);
			}

			setUploadState((s) => ({ ...s, stage: "verifying", progress: 100 }));

			const verifyResult = await verifyVideoUpload({ videoId });

			if (!verifyResult.success) {
				throw new Error(verifyResult.error || "Upload verification failed");
			}

			setUploadState((s) => ({ ...s, stage: "complete", progress: 100 }));
			toastManager.add({
				title: "Video uploaded successfully!",
				type: "success",
			});

			setTimeout(() => {
				reset();
			}, 2000);
		} catch (err) {
			const message = err instanceof Error ? err.message : "Upload failed";
			setUploadState((s) => ({ ...s, stage: "error", error: message }));
			toastManager.add({ title: message, type: "error" });
		}
	}, [uploadState.file, title, description, reset]);

	const isUploading = ["creating", "uploading", "verifying"].includes(
		uploadState.stage,
	);
	const canUpload = !!uploadState.file && title.trim() && !isUploading;

	return (
		<div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
			<Card className="w-full max-w-2xl">
				<CardHeader className="text-center">
					<FileVideo className="mx-auto h-12 w-12 text-muted-foreground" />
					<CardTitle>Upload Video</CardTitle>
					<CardDescription>
						Drag and drop or click to select a video file
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{uploadState.stage === "complete" ? (
						<div className="flex flex-col items-center gap-4 text-center">
							<CheckCircle className="h-16 w-16 text-green-500" />
							<h3 className="text-2xl font-semibold">Upload Complete!</h3>
							<p className="text-muted-foreground">
								Your video is ready for review.
							</p>
							<Button onClick={reset} variant="outline">
								Upload Another
							</Button>
						</div>
					) : (
						<>
							{uploadState.file ? (
								<div className="space-y-4 border rounded-lg p-4">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<FileVideo className="h-8 w-8 text-muted-foreground" />
											<div>
												<p className="font-medium truncate max-w-[200px]">
													{uploadState.file.name}
												</p>
												<p className="text-sm text-muted-foreground">
													{(uploadState.file.size / 1024 / 1024).toFixed(2)} MB
													· {uploadState.file.type}
												</p>
											</div>
										</div>
										<Button
											size="icon"
											variant="ghost"
											onClick={() =>
												setUploadState((s) => ({ ...s, file: undefined }))
											}
										>
											<X className="h-4 w-4" />
										</Button>
									</div>
								</div>
							) : (
								// biome-ignore lint/a11y/useSemanticElements: no-button
								<div
									className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
									onClick={() => fileInputRef.current?.click()}
									onKeyDown={(e) =>
										e.key === "Enter" && fileInputRef.current?.click()
									}
									role="button"
									tabIndex={0}
								>
									<input
										ref={fileInputRef}
										type="file"
										accept={ALLOWED_TYPES.join(",")}
										className="hidden"
										onChange={(e) =>
											e.target.files?.[0] && handleFileSelect(e.target.files[0])
										}
									/>
									<Upload className="mx-auto h-12 w-12 text-muted-foreground" />
									<p className="mt-2 text-lg">Click or drag video here</p>
									<p className="text-sm text-muted-foreground">
										{ALLOWED_TYPES.join(", ")} · Up to{" "}
										{(MAX_SIZE / 1024 / 1024 / 1024).toFixed(1)} GB
									</p>
								</div>
							)}

							<div className="space-y-4">
								<div>
									<Label htmlFor="title">Title *</Label>
									<Input
										id="title"
										value={title}
										onChange={(e) => setTitle(e.target.value)}
										placeholder="Enter video title"
										maxLength={200}
										disabled={isUploading}
									/>
								</div>
								<div>
									<Label htmlFor="description">Description</Label>
									<Input
										id="description"
										value={description}
										onChange={(e) => setDescription(e.target.value)}
										placeholder="Optional description"
										maxLength={5000}
										disabled={isUploading}
									/>
								</div>
							</div>

							{uploadState.stage !== "idle" && (
								<div className="space-y-2">
									<div className="flex justify-between text-sm">
										<span className="capitalize">{uploadState.stage}</span>
										<span>{uploadState.progress}%</span>
									</div>
									<Progress value={uploadState.progress} className="h-2" />
									{uploadState.stage === "uploading" && (
										<p className="text-xs text-muted-foreground">
											Uploading directly to storage...
										</p>
									)}
									{uploadState.error && (
										<p className="text-sm text-red-500" role="alert">
											{uploadState.error}
										</p>
									)}
								</div>
							)}

							<Button
								className="w-full"
								size="lg"
								onClick={handleUpload}
								disabled={!canUpload}
							>
								{isUploading && <Spinner className="mr-2 h-4 w-4" />}
								{uploadState.stage === "creating"
									? "Creating video record..."
									: uploadState.stage === "uploading"
										? "Uploading to storage..."
										: uploadState.stage === "verifying"
											? "Verifying upload..."
											: "Upload Video"}
							</Button>
						</>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
