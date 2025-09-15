type Props = {
  html: string;
};

export default function Prose({ html }: Props) {
  return (
    <div
      className="prose prose-neutral dark:prose-invert max-w-none prose-h2:scroll-mt-24"
      // html is sanitized in the MDX pipeline (rehype-sanitize)
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
