type Props = {
  client?: string;
  role?: string[];
  tools?: string[];
  year?: number;
  tags?: string[];
};

export default function CaseMeta({ client, role = [], tools = [], year, tags = [] }: Props) {
  return (
    <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1">
      {client ? <span>{client}</span> : null}
      {!!role.length && <span>{role.join(", ")}</span>}
      {!!tools.length && <span>{tools.join(", ")}</span>}
      {year ? <span>{year}</span> : null}
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

