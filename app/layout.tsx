import type { Metadata } from "next";

/* Substituto self-hosted da Noka enquanto a licença não chega — Medium (500),
   Bold (700) e Black (900) mapeiam 1:1 os pesos do board. Ver BRAND.md. */
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/700.css";
import "@fontsource/poppins/900.css";
/* Fonte de UI do site da Biscoitê, aqui só como último fallback. */
import "@fontsource/montserrat/500.css";
import "@fontsource/montserrat/700.css";

import "./globals.css";

export const metadata: Metadata = {
  title: "Concorra a uma camiseta autografada pelo Neymar Jr. | Promoção Futi",
  description:
    "Compre produtos Futi, cadastre sua nota fiscal e concorra a uma das 50 camisetas autografadas pelo Neymar Jr. Promoção comercial Biscoitê sujeita a autorização da SPA/MF.",
  robots: {
    // A campanha não pode ser divulgada antes do CA — liberar na publicação.
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-navy focus:px-5 focus:py-3 focus:text-sm focus:font-black focus:text-white"
        >
          Pular para o conteúdo
        </a>
        {children}
      </body>
    </html>
  );
}
