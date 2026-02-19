import { getTournamentBracket } from "@/lib/db/queries/tournament";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ tournamentId: string }> }
) {
  const { tournamentId } = await params;
  const bracket = await getTournamentBracket(tournamentId);
  return NextResponse.json(bracket);
}
