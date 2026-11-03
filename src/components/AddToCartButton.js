"use client";

import { useCart } from "@/context/CartContext";

export default function AddToCartButton({ producto }) {
  const { agregar, items } = useCart();
  const enCarrito = items.find((i) => i.id === producto.id)?.cantidad || 0;
  const agotado = producto.stock <= 0 || enCarrito >= producto.stock;

  return (
    <button
      onClick={() => agregar(producto)}
      disabled={agotado}
      className="mt-4 w-full rounded-md bg-green-700 px-4 py-2 text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-gray-400"
    >
      {producto.stock <= 0
        ? "Agotado"
        : enCarrito >= producto.stock
        ? "Máximo en carrito"
        : "Agregar al carrito"}
    </button>
  );
}