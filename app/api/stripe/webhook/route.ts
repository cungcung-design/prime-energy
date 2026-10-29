import Stripe from "stripe";
import { expireCheckout, failReservedOrder, markOrderPaid } from "@/lib/commerce";
import { errorResponse } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    const key = process.env.STRIPE_SECRET_KEY;
    if (!secret || !key) return Response.json({ error: "Stripe webhook is not configured." }, { status: 503 });
    const stripe = new Stripe(key);
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(await request.text(), request.headers.get("stripe-signature") ?? "", secret);
    } catch {
      return Response.json({ error: "The webhook signature could not be verified." }, { status: 400 });
    }
    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      const session = event.data.object;
      const publicId = session.client_reference_id ?? session.metadata?.orderId;
      if (publicId && session.payment_status === "paid") {
        const intent = typeof session.payment_intent === "string" ? session.payment_intent : null;
        markOrderPaid(publicId, intent, session.amount_total);
      }
    } else if (event.type === "checkout.session.expired") {
      const publicId = event.data.object.client_reference_id;
      if (publicId) expireCheckout(publicId);
    } else if (event.type === "checkout.session.async_payment_failed") {
      const publicId = event.data.object.client_reference_id;
      if (publicId) failReservedOrder(publicId);
    }
    return Response.json({ received: true });
  } catch (error) {
    return errorResponse(error);
  }
}
