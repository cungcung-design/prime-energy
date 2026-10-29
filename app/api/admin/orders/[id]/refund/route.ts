import Stripe from "stripe";
import { markRefunded, orderForStripe } from "@/lib/commerce";
import { errorResponse, requireAdmin } from "@/lib/session";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    if (!process.env.STRIPE_SECRET_KEY) {
      return Response.json({ error: "Refunds need STRIPE_SECRET_KEY. No refund was sent." }, { status: 503 });
    }
    const order = orderForStripe(id);
    if (!order?.stripe_payment_intent) {
      return Response.json({ error: "This order has no verified payment to refund." }, { status: 409 });
    }
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    await stripe.refunds.create({ payment_intent: order.stripe_payment_intent }, { idempotencyKey: `refund_${id}` });
    markRefunded(id);
    return Response.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
