// Small, self-contained logo slot for the nav. Reads the resolved theme and
// renders either an <img> when a logo file is present, or a plain text
// wordmark fallback. Defensive on missing assets so the scaffold doesn't 404
// the first run.

import Image from "next/image";
import type { ResolvedTheme } from "../lib/resolve-theme";

export function CustomerLogo({
  theme,
  customerName,
}: {
  theme: ResolvedTheme;
  customerName: string;
}) {
  if (theme.brandLogoSrc) {
    return (
      <span className="inline-flex items-center" aria-label={theme.brandLogoAlt}>
        <Image
          src={theme.brandLogoSrc}
          alt={theme.brandLogoAlt}
          width={96}
          height={24}
          className="h-6 w-auto object-contain"
          unoptimized
          priority
        />
      </span>
    );
  }
  return <span className="font-semibold">{customerName}</span>;
}
