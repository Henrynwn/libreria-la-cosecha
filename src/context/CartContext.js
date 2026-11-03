"use client";

import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [listo, setListo] = useState(false);

  // Cargar el carrito guardado en el navegador
  useEffect(() => {
    try {
      const guardado = localStorage.getItem("carrito");
      if (guardado) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setItems(JSON.parse(guardado));
      }
    } catch {}
    setListo(true);
  }, []);

  // Guardar cada cambio
  useEffect(() => {
    if (!listo) return;
    try {
      localStorage.setItem("carrito", JSON.stringify(items));
    } catch {}
  }, [items, listo]);

  function agregar(producto) {
    setItems((actual) => {
      const existe = actual.find((i) => i.id === producto.id);
      if (existe) {
        return actual.map((i) =>
          i.id === producto.id
            ? { ...i, cantidad: Math.min(i.cantidad + 1, i.stock) }
            : i
        );
      }
      return [
        ...actual,
        {
          id: producto.id,
          nombre: producto.nombre,
          precio: Number(producto.precio),
          stock: producto.stock,
          cantidad: 1,
        },
      ];
    });
  }

  function cambiarCantidad(id, cantidad) {
    setItems((actual) =>
      actual.map((i) =>
        i.id === id
          ? { ...i, cantidad: Math.max(1, Math.min(cantidad, i.stock)) }
          : i
      )
    );
  }

  function quitar(id) {
    setItems((actual) => actual.filter((i) => i.id !== id));
  }

  function vaciar() {
    setItems([]);
  }

  const total = items.reduce((suma, i) => suma + i.precio * i.cantidad, 0);
  const cantidadTotal = items.reduce((suma, i) => suma + i.cantidad, 0);

  return (
    <CartContext.Provider
      value={{ items, agregar, cambiarCantidad, quitar, vaciar, total, cantidadTotal, listo }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}