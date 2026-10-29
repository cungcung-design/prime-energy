import { cancelOrder } from "@/lib/commerce";
import { currentUser, errorResponse, readReceipts } from "@/lib/session";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const order = cancelOrder(id, await currentUser(), await readReceipts());
    return Response.json({ order });
  } catch (error) {
    return errorResponse(error);
  }
}
