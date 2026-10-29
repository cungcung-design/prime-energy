import { markReviewHelpful } from "@/lib/commerce";
import { errorResponse } from "@/lib/session";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    markReviewHelpful(Number(id));
    return Response.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
