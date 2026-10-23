import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "../mode-toggle";

export function SiteHeader() {
	return (
		<header className="flex h-10 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
			<div className="flex w-full items-center gap-1 px-4">
				<SidebarTrigger className="-ml-1" variant="ghost" />
				<Separator
					orientation="vertical"
					className="mx-2 data-[orientation=vertical]:h-8"
				/>
				<h1 className="text-base font-[300]">Org Details</h1>
				<div className="ml-auto flex items-center gap-2">
					{/* <Button variant="ghost" size="sm" className="hidden sm:flex">
						<a
							href="https://github.com/shadcn-ui/ui/tree/main/apps/v4/app/(examples)/dashboard"
							rel="noopener noreferrer"
							target="_blank"
							className="dark:text-foreground"
						>
							GitHub
						</a>
					</Button> */}
				</div>
				<ModeToggle />
			</div>
		</header>
	);
}
