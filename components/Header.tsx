"use client";

import { useEffect, useState } from "react";
import BrandLockup from "./BrandLockup";
import FutiWordmark from "./FutiWordmark";
import { transactionsAllowed } from "@/lib/promoStatus";

const nav = [
  { href: "#premios", label: "Prêmios" },
  { href: "#como-participar", label: "Como participar" },
  { href: "#produtos", label: "Produtos" },
  { href: "#legal", label: "Regulamento" },
  { href: "#faq", label: "Dúvidas" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const aberto = transactionsAllowed();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors ${
        scrolled || open
          ? "border-b border-line bg-paper/95 backdrop-blur"
          : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-4 md:px-10">
        <a href="#conteudo" className="flex items-center gap-3" aria-label="Promoção Futi — início">
          <FutiWordmark className="h-7 w-auto text-navy" />
          <span className="hidden h-8 w-px bg-navy/20 sm:block" aria-hidden="true" />
          <BrandLockup className="hidden text-[13px] sm:flex" />
        </a>

        <nav className="ml-auto hidden items-center gap-7 lg:flex" aria-label="Seções da página">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-[13px] font-medium text-ink/70 transition-colors hover:text-navy"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <a
          href="#participar"
          className="ml-auto rounded-full bg-navy px-5 py-2.5 text-[11px] font-black uppercase tracking-label text-white transition-colors hover:bg-navy-deep lg:ml-0"
        >
          {aberto ? "Participar" : "Saiba mais"}
        </a>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="menu-mobile"
          className="lg:hidden"
        >
          <span className="sr-only">{open ? "Fechar menu" : "Abrir menu"}</span>
          <svg viewBox="0 0 24 24" className="h-6 w-6 text-navy" fill="none" strokeWidth="2" stroke="currentColor">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 8h16M4 16h16" />}
          </svg>
        </button>
      </div>

      {open && (
        <nav
          id="menu-mobile"
          className="border-t border-line bg-paper px-6 pb-5 pt-2 lg:hidden"
          aria-label="Seções da página"
        >
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block border-b border-line/70 py-3 text-sm font-medium text-ink/80 last:border-0"
            >
              {item.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
