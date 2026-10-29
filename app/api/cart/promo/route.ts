import { applyCartPromo } from "@/lib/commerce";
import { cartToken, currentUser, errorResponse } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    const body = (await request.json()) as { code?: string };
    return Response.json(applyCartPromo(await cartToken(), user?.id ?? null, body.code ?? ""));
  } catch (error) {
    return errorResponse(error);
  }
}
