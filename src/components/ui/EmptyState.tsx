interface Props {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, icon, action }: Props) {
  return (
    <div className="text-center py-12 px-4">
      {icon && <div className="mx-auto mb-3 text-stone-400">{icon}</div>}
      <p className="text-base font-medium text-stone-900">{title}</p>
      {description && <p className="text-sm text-stone-500 mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
