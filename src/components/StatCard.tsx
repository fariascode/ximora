import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  helper?: string;
  icon: LucideIcon;
}

export function StatCard({ title, value, helper, icon: Icon }: StatCardProps) {
  return (
    <article className="panel p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-espresso/60">{title}</p>
          <strong className="mt-2 block text-2xl font-bold text-ink">{value}</strong>
        </div>
        <span className="rounded-2xl bg-pearl p-3 text-espresso">
          <Icon size={20} aria-hidden="true" />
        </span>
      </div>
      {helper ? <p className="mt-3 text-sm text-espresso/60">{helper}</p> : null}
    </article>
  );
}
