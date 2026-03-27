import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

const TOKEN = process.env.REVALIDATE_TOKEN!;

export async function GET(req: NextRequest) {
  const path = req.nextUrl.searchParams.get("path");
  const token = req.nextUrl.searchParams.get("token");

  if (token !== TOKEN) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!path) {
    return NextResponse.json({ error: "missing_path" }, { status: 400 });
  }

  revalidatePath(path);
  return NextResponse.json({ revalidated: true, path });
}
