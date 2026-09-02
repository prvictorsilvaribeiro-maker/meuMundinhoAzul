"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ABAS = [
  { href: "/", label: "Home", d: "M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5" },
  { href: "/enxoval", label: "Enxoval", d: "M4 8h16l-1 13H5L4 8Zm4 0a4 4 0 0 1 8 0" },
  { href: "/quarto", label: "Quarto", d: "M4 20v-9h16v9M7 11V6h10v5M9 20v-4h6v4" },
  { href: "/orcamento", label: "Orçamento", d: "M4 20V10M10 20V4M16 20v-7M22 20H2" },
];

export function TabBar() {
  const path = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-linha bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-md px-2 pb-[max(12px,env(safe-area-inset-bottom))] pt-2">
        {ABAS.map((aba) => {
          const ativa = path === aba.href;
          return (
            <Link
              key={aba.href}
              href={aba.href}
              aria-current={ativa ? "page" : undefined}
              className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[10.5px] ${
                ativa ? "font-semibold text-sky-deep" : "text-ink-soft"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d={aba.d} />
              </svg>
              {aba.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
