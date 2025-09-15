import AspectImage from "@/components/ui/AspectImage";

type Props = {
  title: string;
  cover?: { src: string; alt: string };
  summary?: string;
};

export default function CaseHero({ title, cover, summary }: Props) {
  return (
    <header className="space-y-4">
      {cover ? (
        <AspectImage src={cover.src} alt={cover.alt || title} ratio="16/9" fill sizes="100vw" />
      ) : null}
      <h1 className="text-2xl font-semibold tracking-tight leading-tight">{title}</h1>
      {summary ? <p className="text-muted-foreground">{summary}</p> : null}
    </header>
  );
}
