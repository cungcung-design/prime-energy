import { subscribe } from "@/lib/commerce";
import { errorResponse } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string };
    subscribe(body.email ?? "");
    return Response.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
