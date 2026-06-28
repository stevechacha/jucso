import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";

interface HeroProps {
  badge: string;
  title: ReactNode;
  subtitle?: string;
  cta?: ReactNode;
}

export function Hero({ badge, title, subtitle, cta }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-jucso-navy-dark via-jucso-navy to-[#1a4a6e] px-6 py-16 md:py-20">
      <div
        className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-br from-transparent to-cyan-500/10 pointer-events-none"
        style={{ clipPath: "polygon(20% 0,100% 0,100% 100%,0% 100%)" }}
        aria-hidden
      />
      <div
        className="absolute border border-cyan-400/20 rounded-full w-60 h-60 top-1/4 right-8 pointer-events-none"
        aria-hidden
      />
      <div
        className="absolute border border-cyan-400/15 rounded-full w-36 h-36 top-1/3 right-20 pointer-events-none"
        aria-hidden
      />

      <div className="relative max-w-2xl mx-auto text-center">
        <Badge variant="teal">{badge}</Badge>
        <h1 className="font-display font-extrabold text-white text-3xl md:text-5xl mt-4 mb-4 leading-tight tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-white/70 text-sm md:text-base leading-relaxed max-w-md mx-auto mb-6">
            {subtitle}
          </p>
        )}
        {cta && <div className="flex gap-3 flex-wrap justify-center">{cta}</div>}
      </div>
    </section>
  );
}
