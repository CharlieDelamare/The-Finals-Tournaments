import { getTournaments } from "@/lib/db/queries/tournament";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as never;
  const type = searchParams.get("type") as never;
  const search = searchParams.get("search") || undefined;

  const tournaments = await getTournaments({ status, type, search });
  return NextResponse.json(tournaments);
}
