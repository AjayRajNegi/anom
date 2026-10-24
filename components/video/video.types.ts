export type Annotation = {
	id: string;
	startSeconds: number;
	endSeconds: number;
	comment: string;
};

export function formatTime(seconds: number): string {
	const totalSeconds = Math.max(0, Math.floor(seconds));
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const secs = totalSeconds % 60;

	const twoDigits = (value: number) => String(value).padStart(2, "0");

	if (hours > 0) {
		return `${hours}:${twoDigits(minutes)}:${twoDigits(secs)}`;
	}

	return `${minutes}:${twoDigits(secs)}`;
}

export function formatRange(
	annotation: Pick<Annotation, "startSeconds" | "endSeconds">,
): string {
	return `${formatTime(annotation.startSeconds)} – ${formatTime(
		annotation.endSeconds,
	)}`;
}
