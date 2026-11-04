import PromosEditor from "@/components/admin/PromosEditor";
import { freshContent } from "../data";

export const dynamic = "force-dynamic";

export default async function AdminPromos() {
  const { promos } = await freshContent();
  return (
    <>
      <h1 className="mb-8 text-[28px] font-semibold tracking-[-0.03em]">Promos</h1>
      <PromosEditor initial={promos} />
    </>
  );
}
