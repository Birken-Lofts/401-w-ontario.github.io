import type { ReactNode } from 'react';

export function Eyebrow({
  children,
  ruleWidth = 30,
  className = '',
}: {
  children: ReactNode;
  ruleWidth?: number;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="h-px bg-terracotta" style={{ width: ruleWidth }} />
      <span className="font-body text-xs font-semibold uppercase tracking-[0.28em] text-terracotta">
        {children}
      </span>
    </div>
  );
}

interface Props {
  eyebrow: string;
  title: string;
  light?: boolean;
  className?: string;
}

export default function SectionHeading({ eyebrow, title, light = false, className = '' }: Props) {
  return (
    <div className={className}>
      <Eyebrow className="mb-5">{eyebrow}</Eyebrow>
      <h2
        className={`font-display text-[clamp(40px,5.5vw,72px)] leading-none tracking-[-0.01em] ${
          light ? 'text-cream' : 'text-ink'
        }`}
      >
        {title}
      </h2>
    </div>
  );
}
