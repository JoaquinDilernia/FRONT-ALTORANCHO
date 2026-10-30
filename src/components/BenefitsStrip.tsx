import { BENEFITS } from "@/content/site";
import { BankIcon, CardIcon, TruckIcon } from "./Icons";

const ICONS = { truck: TruckIcon, card: CardIcon, bank: BankIcon };

export default function BenefitsStrip() {
  return (
    <ul className="grid gap-px overflow-hidden bg-line md:grid-cols-3">
      {BENEFITS.map((b) => {
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
