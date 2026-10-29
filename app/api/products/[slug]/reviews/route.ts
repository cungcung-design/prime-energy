import { addReview } from "@/lib/commerce";
import { errorResponse, requireUser } from "@/lib/session";

export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const user = await requireUser();
    const { slug } = await context.params;
    const body = (await request.json()) as { name?: string; title?: string; body?: string; rating?: number };
    const reviews = addReview(user.id, slug, {
      name: body.name ?? "",
      title: body.title ?? "",
      body: body.body ?? "",
      rating: body.rating ?? 5,
    });
    return Response.json({ reviews });
  } catch (error) {
    return errorResponse(error);
  }
}
