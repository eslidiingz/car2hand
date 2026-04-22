import { BadgeCheck, Building2 } from 'lucide-react';

export type VerificationLevel = 'NONE' | 'INDIVIDUAL' | 'CORPORATE';

interface TrustBadgeProps {
  level: VerificationLevel | null | undefined;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

/**
 * TrustBadge — KYC-earned verification badge.
 *
 * IMPORTANT: keep this visually and semantically distinct from Package badges
 * ("Hot Deal", "Premium Choice"). Trust badges mean "identity verified",
 * package badges mean "paid tier".
 */
export default function TrustBadge({ level, size = 'md', showLabel = true, className = '' }: TrustBadgeProps) {
  if (!level || level === 'NONE') return null;

  const meta: Record<Exclude<VerificationLevel, 'NONE'>, {
    label: string;
    icon: React.ReactNode;
    bg: string;
    text: string;
    ring: string;
  }> = {
    INDIVIDUAL: {
      label: 'บุคคลธรรมดา',
      icon: <BadgeCheck />,
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      ring: 'ring-emerald-200',
    },
    CORPORATE: {
      label: 'นิติบุคคล',
      icon: <Building2 />,
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      ring: 'ring-blue-200',
    },
  };

  const m = meta[level];
  const sizing = {
    sm: { wrap: 'text-[10px] px-1.5 py-0.5 gap-0.5', icon: 10 },
    md: { wrap: 'text-xs px-2 py-1 gap-1', icon: 12 },
    lg: { wrap: 'text-sm px-3 py-1.5 gap-1.5', icon: 14 },
  }[size];

  const Icon = m.icon as React.ReactElement<{ size?: number }>;

  return (
    <span
      className={`inline-flex items-center ${sizing.wrap} rounded-full font-bold ring-1 ${m.bg} ${m.text} ${m.ring} ${className}`}
      title={m.label}
    >
      {typeof Icon !== 'string' && Icon ? <Icon.type {...(Icon.props || {})} size={sizing.icon} /> : null}
      {showLabel && <span>{m.label}</span>}
    </span>
  );
}
