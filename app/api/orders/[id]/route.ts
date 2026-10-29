import Stripe from "stripe";
import { getCustomerOrder, markOrderPaid, orderForStripe } from "@/lib/commerce";
import { currentUser, errorResponse, readReceipts } from "@/lib/session";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const sessionId = new URL(request.url).searchParams.get("session_id");
    if (sessionId && process.env.STRIPE_SECRET_KEY) {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.client_reference_id === id && session.payment_status === "paid") {
        const intent = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null;
        markOrderPaid(id, intent, session.amount_total);
      }
    }
    const user = await currentUser();
    const order = getCustomerOrder(id, user, await readReceipts());
    if (!order) return Response.json({ error: "That order was not found." }, { status: 404 });
    const stored = orderForStripe(id);
    return Response.json({
      order: {
        ...order,
        paymentState: stored?.payment_state === "pending_payment" ? "pending" : stored?.payment_state ?? order.paymentState,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
