import { findProduct, reviewsFor } from "@/lib/commerce";
import { errorResponse } from "@/lib/session";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const product = findProduct(slug);
    if (!product) return Response.json({ error: "That product was not found." }, { status: 404 });
    return Response.json({ product, reviews: reviewsFor(slug) });
  } catch (error) {
    return errorResponse(error);
  }
}
