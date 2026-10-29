import { clearCart, mutateCart, readCart } from "@/lib/commerce";
import { cartToken, currentUser, errorResponse } from "@/lib/session";

export async function GET() {
  try {
    const user = await currentUser();
    return Response.json(readCart(await cartToken(), user?.id ?? null));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    const body = (await request.json()) as { slug?: string; qty?: number; mode?: "set" | "add" };
    return Response.json(mutateCart(await cartToken(), user?.id ?? null, body.slug ?? "", Number(body.qty ?? 1), body.mode === "add" ? "add" : "set"));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE() {
  try {
    const user = await currentUser();
    return Response.json(clearCart(await cartToken(), user?.id ?? null));
  } catch (error) {
    return errorResponse(error);
  }
}
