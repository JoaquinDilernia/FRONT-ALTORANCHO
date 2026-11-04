import { getContent } from "@/lib/content";
import { BankIcon, CardIcon, TruckIcon } from "./Icons";

const ICONS = { truck: TruckIcon, card: CardIcon, bank: BankIcon };
const COLS: Record<number, string> = { 1: "", 2: "md:grid-cols-2", 3: "md:grid-cols-3", 4: "md:grid-cols-4" };

export default async function BenefitsStrip() {
  const { promos } = await getContent();
  return (
    <ul className={`grid gap-px overflow-hidden bg-line ${COLS[promos.benefits.length] ?? "md:grid-cols-3"}`}>
      {promos.benefits.map((b) => {
        const Icon = ICONS[b.icon];
        return (
          <li key={b.title} className="flex items-center gap-4 bg-sand p-6">
            <Icon className="size-7 shrink-0 text-walnut" />
            <p className="text-[14px] leading-snug">
              <b className="block font-semibold">{b.title}</b>
              {b.copy}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
