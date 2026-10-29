import { adminSnapshot } from "@/lib/commerce";
import { errorResponse, requireAdmin } from "@/lib/session";

export async function GET() {
  try {
    await requireAdmin();
    return Response.json(adminSnapshot());
  } catch (error) {
    return errorResponse(error);
  }
}
