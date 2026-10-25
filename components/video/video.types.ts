export type Annotation = {
	id: string;
	startMs: number;
	endMs: number;
	body: string;
	authorId: string;
};

export function formatTime(milliseconds: number): string {
	const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
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
	annotation: Pick<Annotation, "startMs" | "endMs">,
): string {
	return `${formatTime(annotation.startMs)} – ${formatTime(annotation.endMs)}`;
}
