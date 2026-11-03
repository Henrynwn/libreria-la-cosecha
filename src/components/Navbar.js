"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const { cantidadTotal } = useCart();

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between p-4">
        <Link href="/" className="text-2xl font-bold">
          Librería La Cosecha
        </Link>
        <Link
          href="/carrito"
          className="rounded-md border px-4 py-2 hover:bg-gray-100"
        >
          🛒 Carrito ({cantidadTotal})
        </Link>
      </div>
    </nav>
  );
}