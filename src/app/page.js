import { supabase } from "@/lib/supabase";
import AddToCartButton from "@/components/AddToCartButton";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { data: productos, error } = await supabase
    .from("productos")
    .select("*")
    .eq("activo", true)
    .order("id");

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="mb-6 text-xl text-gray-600">Nuestro catálogo</h1>

      {error && (
        <p className="text-red-600">Error al cargar productos: {error.message}</p>
      )}

      {productos && productos.length === 0 && (
        <p className="text-gray-600">No hay productos disponibles.</p>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {productos?.map((p) => (
          <article key={p.id} className="rounded-lg border p-4 shadow-sm">
            <h2 className="text-lg font-semibold">{p.nombre}</h2>
            <p className="text-sm text-gray-600">{p.autor}</p>
            <p className="mt-2 text-sm">{p.descripcion}</p>
            <p className="mt-3 text-xl font-bold">
              {Number(p.precio).toLocaleString("es-MX", {
                style: "currency",
                currency: "MXN",
              })}
            </p>
            <p className="text-sm text-gray-500">Disponibles: {p.stock}</p>
            <AddToCartButton producto={p} />
          </article>
        ))}
      </div>
    </main>
  );
}