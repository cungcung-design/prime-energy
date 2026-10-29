import { clearSession, errorResponse } from "@/lib/session";

export async function POST() {
  try {
    await clearSession();
    return Response.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
