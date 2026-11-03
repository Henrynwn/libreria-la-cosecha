import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request) {
  try {
    const { nombre, email, items } = await request.json();

    if (
      !nombre || nombre.trim().length < 3 ||
      !email || !email.includes("@") ||
      !Array.isArray(items) || items.length === 0
    ) {
      return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
    }

    // Los precios se leen de la base de datos, nunca del navegador
    const ids = items.map((i) => Number(i.id));
    const { data: productos, error: errProd } = await supabaseAdmin
      .from("productos")
      .select("id, nombre, precio, stock, activo")
      .in("id", ids);
    if (errProd) throw errProd;

    const lineas = [];
    let total = 0;

    for (const item of items) {
      const p = productos.find((x) => x.id === Number(item.id));
      const cantidad = Number(item.cantidad);

      if (!p || !p.activo) {
        return NextResponse.json({ error: "Un producto ya no está disponible." }, { status: 400 });
      }
      if (!Number.isInteger(cantidad) || cantidad < 1) {
        return NextResponse.json({ error: "Cantidad inválida." }, { status: 400 });
      }
      if (cantidad > p.stock) {
        return NextResponse.json(
          { error: `No hay suficientes existencias de "${p.nombre}".` },
          { status: 400 }
        );
      }

      lineas.push({ producto: p, cantidad });
      total += Number(p.precio) * cantidad;
    }

    // Crear el pedido en estado "pendiente"
    const { data: pedido, error: errPedido } = await supabaseAdmin
      .from("pedidos")
      .insert({
        cliente_nombre: nombre.trim(),
        cliente_email: email.trim(),
        total,
        estado: "pendiente",
      })
      .select()
      .single();
    if (errPedido) throw errPedido;

    const { error: errDetalle } = await supabaseAdmin.from("detalle_pedido").insert(
      lineas.map((l) => ({
        pedido_id: pedido.id,
        producto_id: l.producto.id,
        cantidad: l.cantidad,
        precio_unitario: l.producto.precio,
      }))
    );
    if (errDetalle) throw errDetalle;

    // Crear la preferencia de pago en Mercado Pago
    const sitio = process.env.NEXT_PUBLIC_SITE_URL;
    const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

    const preferencia = await new Preference(mp).create({
      body: {
        items: lineas.map((l) => ({
          id: String(l.producto.id),
          title: l.producto.nombre,
          quantity: l.cantidad,
          unit_price: Number(l.producto.precio),
          currency_id: "MXN",
        })),
        external_reference: String(pedido.id),
        back_urls: {
          success: `${sitio}/pago/exito`,
          failure: `${sitio}/pago/fallo`,
          pending: `${sitio}/pago/pendiente`,
        },
        auto_return: "approved",
        notification_url: `${sitio}/api/webhook`,
      },
    });

    await supabaseAdmin
      .from("pedidos")
      .update({ mp_preference_id: preferencia.id })
      .eq("id", pedido.id);

    return NextResponse.json({ url: preferencia.init_point, pedidoId: pedido.id });
  } catch (err) {
    console.error("Error en checkout:", err);
    return NextResponse.json({ error: "No se pudo iniciar el pago." }, { status: 500 });
  }
}