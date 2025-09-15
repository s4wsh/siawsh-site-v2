type Props = {
  title: string;
  children: React.ReactNode;
};

export default function CaseSection({ title, children }: Props) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 text-lg font-semibold relative glow-underline">{title}</h2>
      <div className="glow-line my-4" />
      <div className="text-sm leading-6 text-muted-foreground space-y-3">{children}</div>
    </section>
  );
}

