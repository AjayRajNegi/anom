export default async function VideoPage({
	params,
}: {
	params: Promise<{ videoId: string }>;
}) {
	const { videoId } = await params;
	return <div className="">Video {videoId}</div>;
}
