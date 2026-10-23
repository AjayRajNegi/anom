export default async function VideoPage({
	params,
}: {
	params: Promise<{ videoId: string }>;
}) {
	const { videoId } = await params;
	return (
		<div className="flex flex-col h-screen w-screen items-center justify-center">
			<div className="uppercase tracking-widest text-3xl">Video Page</div>
			<p className="font-thin">Video: {videoId}</p>
		</div>
	);
}
