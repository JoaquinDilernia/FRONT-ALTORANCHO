import HomeEditor from "@/components/admin/HomeEditor";
import { categoryOptions, freshContent } from "../data";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const [content, categories] = await Promise.all([freshContent(), categoryOptions()]);
  return (
    <>
      <h1 className="text-[28px] font-semibold tracking-[-0.03em]">Home</h1>
      <p className="mb-6 mt-1 text-[14px] text-ink-soft">Los bloques de la home en el orden en que aparecen. Tocá uno para editarlo.</p>
      <HomeEditor initial={content.home.sections} categories={categories} />
    </>
  );
}
