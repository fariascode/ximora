import { Sparkles } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="panel flex flex-col items-center justify-center px-6 py-12 text-center">
      <span className="rounded-2xl bg-pearl p-4 text-espresso">
        <Sparkles size={28} aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-lg font-bold text-ink">{title}</h2>
      <p className="mt-2 max-w-sm text-sm text-espresso/65">{description}</p>
    </div>
  );
}
