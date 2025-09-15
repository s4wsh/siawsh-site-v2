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
        <AspectImage
          src={cover.src}
          alt={cover.alt || title}
          fill
          sizes="100vw"
          // 16:9 on mobile, 21:9 on md+
          wrapperClassName="rounded-2xl glow-card aspect-[16/9] md:aspect-[21/9]"
        />
      ) : null}
      <h1 className="text-2xl font-semibold tracking-tight leading-tight">{title}</h1>
      {summary ? <p className="text-muted-foreground">{summary}</p> : null}
    </header>
  );
}
