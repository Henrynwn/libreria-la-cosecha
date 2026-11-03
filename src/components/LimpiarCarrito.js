"use client";

import { useEffect } from "react";
import { useCart } from "@/context/CartContext";

export default function LimpiarCarrito() {
  const { vaciar, listo } = useCart();

  useEffect(() => {
    if (listo) vaciar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listo]);

  return null;
}