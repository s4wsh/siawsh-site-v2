type Props = {
  date?: string;
  tags?: string[];
  readingMinutes?: number;
};

export default function BlogMeta({ date, tags = [], readingMinutes }: Props) {
  return (
    <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1">
      {date ? <span>{date.slice(0, 10)}</span> : null}
      {typeof readingMinutes === "number" ? <span>• {readingMinutes} min read</span> : null}
      {!!tags.length && (
        <span className="flex flex-wrap gap-1">
          {tags.map((t) => (
            <span key={t} className="rounded bg-muted px-2 py-0.5 text-[11px]">{t}</span>
          ))}
        </span>
      )}
    </div>
  );
}

