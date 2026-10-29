import { listCustomerOrders } from "@/lib/commerce";
import { errorResponse, requireUser } from "@/lib/session";

export async function GET() {
  try {
    const user = await requireUser();
    return Response.json({ orders: listCustomerOrders(user.id) });
  } catch (error) {
    return errorResponse(error);
  }
}
