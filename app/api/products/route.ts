import { listProducts } from "@/lib/commerce";
import { errorResponse } from "@/lib/session";
import { connection } from "next/server";

export async function GET() {
  try {
    await connection();
    return Response.json({ products: listProducts() });
  } catch (error) {
    return errorResponse(error);
  }
}
