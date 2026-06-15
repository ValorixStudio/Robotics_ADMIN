interface BrandLogoProps {
  compact?: boolean;
  light?: boolean;
}

export default function BrandLogo({ compact = false, light = false }: BrandLogoProps) {
  return (
    <div className="flex items-center gap-3">
      <div className={`${compact ? "h-12 w-12" : "h-16 w-16"} flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-black shadow-lg ring-2 ${light ? "ring-white/80" : "ring-zinc-200 dark:ring-zinc-700"}`}>
        <img
          src="/teachly-logo.png"
          alt="Teachly Edutech Pvt Ltd"
          className="h-full w-full scale-[1.34] object-cover"
        />
      </div>
      <div className="min-w-0">
        <div className={`${compact ? "text-sm" : "text-lg"} font-sans font-bold tracking-tight ${light ? "text-white" : "text-zinc-950 dark:text-white"}`}>Teachly</div>
        <div className={`${compact ? "text-[8px]" : "text-[9px]"} uppercase tracking-[0.16em] ${light ? "text-white/55" : "text-zinc-400 dark:text-zinc-500"}`}>Edutech Pvt Ltd</div>
      </div>
    </div>
  );
}
