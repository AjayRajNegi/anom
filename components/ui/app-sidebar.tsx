"use client";

import {
	ChartBarIcon,
	CircleFadingPlayIcon,
	DatabaseIcon,
	FolderUserIcon,
	ListIcon,
	UploadIcon,
	User2Icon,
	UserIcon,
} from "lucide-react";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth/auth-client";
import { NavMain } from "./sidebar/nav-main";
import { NavSecondary } from "./sidebar/nav-secondary";
import { NavUser } from "./sidebar/nav-user";

const data = {
	user: {
		name: "shadcn",
		email: "m@example.com",
		avatar: "/avatars/shadcn.jpg",
	},
	navMain: [
		{
			title: "Upload",
			url: "/anom-org/upload",
			icon: UploadIcon,
		},
		{
			title: "Lifecycle",
			url: "#",
			icon: ListIcon,
		},
		{
			title: "Analytics",
			url: "#",
			icon: ChartBarIcon,
		},
		{
			title: "Projects",
			url: "#",
			icon: FolderUserIcon,
		},
		{
			title: "Team",
			url: "#",
			icon: UserIcon,
		},
	],
	// navClouds: [
	// 	{
	// 		title: "Capture",
	// 		icon: CameraIcon,
	// 		isActive: true,
	// 		url: "#",
	// 		items: [
	// 			{
	// 				title: "Active Proposals",
	// 				url: "#",
	// 			},
	// 			{
	// 				title: "Archived",
	// 				url: "#",
	// 			},
	// 		],
	// 	},
	// 	{
	// 		title: "Proposal",
	// 		icon: FileTextIcon,
	// 		url: "#",
	// 		items: [
	// 			{
	// 				title: "Active Proposals",
	// 				url: "#",
	// 			},
	// 			{
	// 				title: "Archived",
	// 				url: "#",
	// 			},
	// 		],
	// 	},
	// ],
	navSecondary: [
		{
			title: "Profile",
			url: "/profile",
			icon: User2Icon,
		},
	],
	documents: [
		{
			name: "Data Library",
			url: "#",
			icon: DatabaseIcon,
		},
	],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { data: session, isPending, error } = authClient.useSession();
	const user = session?.user;

	return (
		<Sidebar collapsible="offcanvas" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton className="data-[slot=sidebar-menu-button]:p-1.5!">
							<a href="/anom-org" className="flex items-center gap-2">
								<CircleFadingPlayIcon className="size-5!" />
								<span className="text-base font-semibold">Anom Org.</span>
							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={data.navMain} />
				<NavSecondary items={data.navSecondary} className="mt-auto" />
			</SidebarContent>
			<SidebarFooter>
				{isPending ? (
					<div className="p-2 text-sm text-muted-foreground">
						Loading user...
					</div>
				) : user ? (
					<NavUser
						user={{
							name: user.name || "User",
							email: user.email || "",
							avatar: user.image || "",
						}}
					/>
				) : (
					<div className="p-2 text-sm text-muted-foreground">
						{error ? "Unable to load user" : "Not signed in"}
					</div>
				)}
			</SidebarFooter>
		</Sidebar>
	);
}
