import { resetPassword } from "@/lib/commerce";
import { errorResponse } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { token?: string; password?: string };
    resetPassword(body.token ?? "", body.password ?? "");
    return Response.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
