import { requestReset } from "@/lib/commerce";
import { errorResponse } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string };
    const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
    requestReset(body.email ?? "", origin);
    return Response.json({
      message: "If an account exists for that email, a reset link is ready. Check the server log in development when email is not configured.",
    });
  } catch (error) {
    return errorResponse(error);
  }
}
