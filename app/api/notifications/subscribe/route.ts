import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { saveSubscription } from "@/lib/notifications/web-push";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const userId = session.user.id;
    const subscription = await request.json();

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: "Suscripción inválida" },
        { status: 400 }
      );
    }

    const result = await saveSubscription(userId, subscription);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error subscribing to notifications:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 }
    );
  }
}
