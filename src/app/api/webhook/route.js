import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request) {
  try {
    const url = new URL(request.url);
    let tipo = url.searchParams.get("type") || url.searchParams.get("topic");
    let paymentId = url.searchParams.get("data.id") || url.searchParams.get("id");

    if (!paymentId) {
      const body = await request.json().catch(() => ({}));
      paymentId = body?.data?.id;
      tipo = tipo || body?.type;
    }

    if (tipo !== "payment" || !paymentId) {
      return NextResponse.json({ ok: true });
    }

    // No confiamos en lo que llega: consultamos el pago directo a Mercado Pago
    const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
    const pago = await new Payment(mp).get({ id: paymentId });

    const pedidoId = Number(pago.external_reference);
    if (!pedidoId) return NextResponse.json({ ok: true });

    const { data: pedido } = await supabaseAdmin
      .from("pedidos")
      .select("id, total, estado")
      .eq("id", pedidoId)
      .single();
    if (!pedido) return NextResponse.json({ ok: true });

    if (pago.status === "approved") {
      if (Number(pago.transaction_amount) < Number(pedido.total)) {
        console.error("Monto pagado menor al total del pedido", pedidoId);
        return NextResponse.json({ ok: true });
      }
      const { error } = await supabaseAdmin.rpc("confirmar_pedido", {
        p_pedido_id: pedidoId,
        p_payment_id: String(pago.id),
      });
      if (error) throw error;
    } else if (
      ["rejected", "cancelled"].includes(pago.status) &&
      pedido.estado === "pendiente"
    ) {
      await supabaseAdmin
        .from("pedidos")
        .update({ estado: "rechazado", mp_payment_id: String(pago.id) })
        .eq("id", pedidoId);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error en webhook:", err);
    // Un 500 hace que Mercado Pago reintente la notificación
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}