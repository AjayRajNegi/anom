import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Warm, wind-swept grass backdrop drawn with SVG noise (no image asset needed). */
export function Meadow({
	children,
	className,
}: {
	children?: ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"relative isolate overflow-hidden rounded-[28px] bg-[#c9b387]",
				className,
			)}
		>
			<svg
				aria-hidden
				className="absolute left-1/2 top-1/2 -z-10 h-[190%] w-[190%] -translate-x-1/2 -translate-y-1/2 -rotate-[62deg]"
			>
				<filter
					id="meadow"
					x="0"
					y="0"
					width="100%"
					height="100%"
					colorInterpolationFilters="sRGB"
				>
					<feTurbulence
						type="fractalNoise"
						baseFrequency="0.004 0.11"
						numOctaves="4"
						seed="11"
					/>
					<feColorMatrix
						type="matrix"
						values="2.4 0 0 0 -0.7  2.4 0 0 0 -0.7  2.4 0 0 0 -0.7  0 0 0 0 1"
					/>
					<feComponentTransfer>
						<feFuncR type="table" tableValues="0.40 0.62 0.86 0.95" />
						<feFuncG type="table" tableValues="0.33 0.52 0.74 0.86" />
						<feFuncB type="table" tableValues="0.18 0.33 0.52 0.68" />
					</feComponentTransfer>
				</filter>
				<rect width="100%" height="100%" filter="url(#meadow)" />
			</svg>
			<div
				aria-hidden
				className="absolute inset-0 -z-10 bg-[radial-gradient(120%_80%_at_0%_0%,rgba(96,98,52,.35),transparent_60%)]"
			/>
			{children}
		</div>
	);
}
