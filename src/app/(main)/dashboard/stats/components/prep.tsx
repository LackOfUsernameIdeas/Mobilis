export default function PrepSection({
  title,
  duration,
  items,
}: {
  title: string;
  duration?: number;
  items?: string[];
}) {
  if (!items?.length) return null;

  return (
    <div className="bg-muted/40 rounded-lg border border-dashed p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium">{title}</p>
        <span className="text-muted-foreground text-xs">{duration} мин</span>
      </div>
      <ul className="text-muted-foreground list-disc space-y-1 pl-4 text-xs">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
