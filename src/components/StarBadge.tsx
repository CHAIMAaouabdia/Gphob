import { Star } from 'lucide-react';

interface StarBadgeProps {
  level: number;
  total: number;
}

export default function StarBadge({ level, total }: StarBadgeProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-xs">
      {Array.from({ length: total }).map((_, i) => (
        <Star
          key={i}
          className={`w-5 h-5 transition-all duration-500 ${
            i <= level ? 'text-amber-400 fill-amber-400 anim-star' : 'text-sky-200/70'
          }`}
          style={i <= level ? { animationDelay: `${i * 0.06}s` } : undefined}
        />
      ))}
    </div>
  );
}
