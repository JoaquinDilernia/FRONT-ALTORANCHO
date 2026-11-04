import HomeSections from "@/components/HomeSections";
import { getContent } from "@/lib/content";

// Los bloques, su orden y sus textos se editan en /admin/home.
export default async function Home() {
  const { home } = await getContent();
  return (
    <>
      <h1 className="sr-only">altorancho. Muebles, iluminación y deco</h1>
      <HomeSections sections={home.sections} />
    </>
  );
}
