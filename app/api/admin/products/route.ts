import { saveAdminProduct } from "@/lib/commerce";
import { errorResponse, requireAdmin } from "@/lib/session";

export async function PUT(request: Request) {
  try {
    await requireAdmin();
    const body = (await request.json()) as { product?: Record<string, unknown>; originalSku?: string };
    return Response.json(saveAdminProduct(body.product ?? {}, body.originalSku ?? ""));
  } catch (error) {
    return errorResponse(error);
  }
}
