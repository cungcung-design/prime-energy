import { changePassword } from "@/lib/commerce";
import { errorResponse, requireUser } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = (await request.json()) as { current?: string; next?: string };
    changePassword(user.id, body.current ?? "", body.next ?? "");
    return Response.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
