import Link from "next/link";
import LimpiarCarrito from "@/components/LimpiarCarrito";

const mensajes = {
  exito: {
    titulo: "¡Gracias por tu compra!",
    texto: "Recibimos tu pago. Estamos confirmándolo y actualizando tu pedido.",
    color: "text-green-700",
  },
  pendiente: {
    titulo: "Tu pago está pendiente",
    texto: "Mercado Pago aún está procesando tu pago. Te avisaremos al confirmarse.",
    color: "text-yellow-700",
  },
  fallo: {
    titulo: "No se pudo completar el pago",
    texto: "Tu pago no fue procesado. Puedes volver a intentarlo desde el carrito.",
    color: "text-red-700",
  },
};

export default async function Resultado({ params, searchParams }) {
  const { estado } = await params;
  const query = await searchParams;
  const info = mensajes[estado] || mensajes.fallo;
  const pedido = Array.isArray(query.external_reference)
    ? query.external_reference[0]
    : query.external_reference;

  return (
    <main className="mx-auto max-w-2xl p-6 text-center">
      {estado === "exito" && <LimpiarCarrito />}
      <h1 className={`mb-4 text-3xl font-bold ${info.color}`}>{info.titulo}</h1>
      <p className="mb-2 text-gray-700">{info.texto}</p>
      {pedido && <p className="mb-6 text-sm text-gray-500">Número de pedido: {pedido}</p>}
      <Link
        href={estado === "fallo" ? "/carrito" : "/"}
        className="inline-block rounded-md bg-green-700 px-6 py-2 text-white hover:bg-green-800"
      >
        {estado === "fallo" ? "Volver al carrito" : "Seguir comprando"}
      </Link>
    </main>
  );
}