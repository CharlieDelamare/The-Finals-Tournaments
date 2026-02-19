import { getAllTeams } from "@/lib/db/queries/team";
import { NextResponse } from "next/server";

export async function GET() {
  const teams = await getAllTeams();
  return NextResponse.json(teams);
}
