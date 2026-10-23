import type { Metadata } from "next";
import { CatalogContent } from "./catalog-content";

export const metadata: Metadata = {
	title: "Video Catalog",
	description: "Browse all videos in your organization",
};

export default async function CatalogPage() {
	return (
		<div>
			<CatalogContent />
		</div>
	);
}
