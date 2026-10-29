import Stripe from "stripe";
import { attachStripeSession, checkout, failReservedOrder, orderForStripe } from "@/lib/commerce";
import { cartToken, currentUser, errorResponse, rememberReceipt } from "@/lib/session";

export async function POST(request: Request) {
  let createdId = "";
  try {
    const user = await currentUser();
    const body = (await request.json()) as {
      idempotencyKey?: string;
      delivery?: "standard" | "express";
      payment?: string;
      email?: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      street?: string;
      apartment?: string;
      city?: string;
      state?: string;
      zip?: string;
      country?: string;
    };
    const result = checkout({
      token: await cartToken(),
      userId: user?.id ?? null,
      idempotencyKey: body.idempotencyKey ?? "",
      delivery: body.delivery === "express" ? "express" : "standard",
      payment: body.payment ?? "card",
      email: body.email ?? "",
      firstName: body.firstName ?? "",
      lastName: body.lastName ?? "",
      phone: body.phone ?? "",
      address: {
        street: body.street ?? "",
        apartment: body.apartment ?? "",
        city: body.city ?? "",
        region: body.state ?? "",
        postal: body.zip ?? "",
        country: body.country ?? "United States",
      },
    });
    const order = orderForStripe(result.orderId);
    if (!order) return Response.json({ error: "The order could not be found." }, { status: 404 });
    if (result.receipt) await rememberReceipt(order.public_id, result.receipt);
    if (order.payment_state === "paid") return Response.json({ orderId: order.public_id, url: null });
    if (order.stripe_session_id) {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");
      const session = await stripe.checkout.sessions.retrieve(order.stripe_session_id);
      return Response.json({ orderId: order.public_id, url: session.url });
    }
    createdId = result.reused ? "" : order.public_id;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");
    const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        client_reference_id: order.public_id,
        customer_email: order.email,
        success_url: `${origin}/orders/${order.public_id}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/checkout?payment=cancelled&order=${order.public_id}`,
        metadata: { orderId: order.public_id },
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "usd",
              unit_amount: order.total_cents,
              product_data: { name: `PRIME order ${order.public_id}` },
            },
          },
        ],
      },
      { idempotencyKey: `prime_${order.public_id}` },
    );
    if (session.id) attachStripeSession(order.public_id, session.id);
    return Response.json({ orderId: order.public_id, url: session.url });
  } catch (error) {
    if (createdId) {
      try {
        failReservedOrder(createdId);
      } catch (releaseError) {
        console.error(releaseError instanceof Error ? releaseError.message : "stock release failed");
      }
    }
    return errorResponse(error);
  }
}
