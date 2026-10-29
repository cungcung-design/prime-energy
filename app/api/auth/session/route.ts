import { profileFor } from "@/lib/commerce";
import { currentUser, errorResponse } from "@/lib/session";

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) return Response.json({ account: null });
    return Response.json({ account: profileFor(user.id) });
  } catch (error) {
    return errorResponse(error);
  }
}
