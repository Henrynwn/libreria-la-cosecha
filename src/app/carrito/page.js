"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/context/CartContext";

const pesos = (n) =>
  n.toLocaleString("es-MX", { style: "currency", currency: "MXN" });

export default function CarritoPage() {
  const { items, cambiarCantidad, quitar, vaciar, total, listo } = useCart();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");

  if (!listo) return <main className="mx-auto max-w-5xl p-6">Cargando…</main>;

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-5xl p-6">
        <h1 className="mb-4 text-2xl font-bold">Tu carrito</h1>
        <p className="mb-4 text-gray-600">Tu carrito está vacío.</p>
        <Link href="/" className="text-green-700 underline">
          Volver al catálogo
        </Link>
      </main>
    );
  }

  const datosValidos = nombre.trim().length > 2 && email.includes("@");

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Tu carrito</h1>

      <div className="space-y-4">
        {items.map((i) => (
          <div
            key={i.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4"
          >
            <div>
              <p className="font-semibold">{i.nombre}</p>
              <p className="text-sm text-gray-600">{pesos(i.precio)} c/u</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => cambiarCantidad(i.id, i.cantidad - 1)}
                className="h-8 w-8 rounded border hover:bg-gray-100"
              >
                −
              </button>
              <span className="w-8 text-center">{i.cantidad}</span>
              <button
                onClick={() => cambiarCantidad(i.id, i.cantidad + 1)}
                className="h-8 w-8 rounded border hover:bg-gray-100"
              >
                +
              </button>
            </div>

            <p className="w-28 text-right font-bold">
              {pesos(i.precio * i.cantidad)}
            </p>

            <button
              onClick={() => quitar(i.id)}
              className="text-sm text-red-600 hover:underline"
            >
              Quitar
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between border-t pt-4">
        <button onClick={vaciar} className="text-sm text-gray-600 hover:underline">
          Vaciar carrito
        </button>
        <p className="text-2xl font-bold">Total: {pesos(total)}</p>
      </div>

      <section className="mt-8 rounded-lg border p-4">
        <h2 className="mb-4 text-lg font-semibold">Datos del cliente</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            type="text"
            placeholder="Nombre completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="rounded border p-2"
          />
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded border p-2"
          />
        </div>

        <button
          disabled
          className="mt-4 w-full rounded-md bg-blue-600 px-4 py-3 text-white disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          Pagar con Mercado Pago (próximo paso)
        </button>
        {!datosValidos && (
          <p className="mt-2 text-sm text-gray-500">
            Llena tu nombre y correo para continuar.
          </p>
        )}
      </section>
    </main>
  );
}