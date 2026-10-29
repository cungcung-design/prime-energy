import { saveMessage } from "@/lib/commerce";
import { errorResponse } from "@/lib/session";
import { connection } from "next/server";

export async function POST(request: Request) {
  try {
    await connection();
    const body = (await request.json()) as { name?: string; email?: string; topic?: string; body?: string };
    saveMessage(body);
    return Response.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
