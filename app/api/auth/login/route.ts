import { loginAccount } from "@/lib/commerce";
import { errorResponse, startSession } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string; remember?: boolean };
    const user = loginAccount(body.email ?? "", body.password ?? "");
    await startSession(user.id, Boolean(body.remember));
    return Response.json({ ok: true, role: user.role });
  } catch (error) {
    return errorResponse(error);
  }
}
