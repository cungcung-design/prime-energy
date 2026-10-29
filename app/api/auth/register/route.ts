import { registerAccount } from "@/lib/commerce";
import { errorResponse, startSession } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string; firstName?: string; lastName?: string; newsletter?: boolean };
    const userId = registerAccount({
      email: body.email ?? "",
      password: body.password ?? "",
      firstName: body.firstName ?? "",
      lastName: body.lastName ?? "",
      newsletter: Boolean(body.newsletter),
    });
    await startSession(userId, true);
    return Response.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
