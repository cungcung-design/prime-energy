import { saveProfile } from "@/lib/commerce";
import { errorResponse, requireUser } from "@/lib/session";

export async function PATCH(request: Request) {
  try {
    const user = await requireUser();
    const body = (await request.json()) as Record<string, unknown>;
    return Response.json({ account: saveProfile(user.id, body) });
  } catch (error) {
    return errorResponse(error);
  }
}
