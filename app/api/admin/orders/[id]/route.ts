import { updateFulfillment } from "@/lib/commerce";
import { errorResponse, requireAdmin } from "@/lib/session";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const body = (await request.json()) as { fulfillment?: string; tracking?: string };
    return Response.json(updateFulfillment(id, body.fulfillment ?? "", body.tracking ?? ""));
  } catch (error) {
    return errorResponse(error);
  }
}
