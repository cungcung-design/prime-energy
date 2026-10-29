import { deleteAdminProduct } from "@/lib/commerce";
import { errorResponse, requireAdmin } from "@/lib/session";

export async function DELETE(_request: Request, context: { params: Promise<{ sku: string }> }) {
  try {
    await requireAdmin();
    const { sku } = await context.params;
    return Response.json(deleteAdminProduct(decodeURIComponent(sku)));
  } catch (error) {
    return errorResponse(error);
  }
}
