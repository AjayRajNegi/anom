import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";

export async function GET(request: Request) {
	const session = await auth.api.getSession({
		headers: request.headers,
	});

	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	return NextResponse.json({
		email: session.user.email,
		id: session.user.id,
	});
}
