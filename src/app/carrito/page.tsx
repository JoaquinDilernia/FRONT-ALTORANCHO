import type { Metadata } from "next";
import CartPage from "@/components/CartPage";

export const metadata: Metadata = { title: "Carrito — altorancho." };

export default function Page() {
  return <CartPage />;
}
