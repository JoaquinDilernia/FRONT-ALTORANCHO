import HelpEditor from "@/components/admin/HelpEditor";
import { freshContent } from "../data";

export const dynamic = "force-dynamic";

export default async function AdminHelp() {
  const { ayuda } = await freshContent();
  return (
    <>
      <h1 className="text-[28px] font-semibold tracking-[-0.03em]">Ayuda</h1>
      <p className="mb-6 mt-1 text-[14px] text-ink-soft">Los textos de las páginas de ayuda del footer.</p>
      <HelpEditor initial={ayuda.pages} />
    </>
  );
}
