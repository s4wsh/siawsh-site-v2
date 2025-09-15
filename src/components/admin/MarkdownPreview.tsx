"use client";
import * as React from "react";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeStringify from "rehype-stringify";

export default function MarkdownPreview({ value }: { value: string }) {
  const [html, setHtml] = React.useState<string>("");

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const file = await unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkRehype)
        .use(rehypeSanitize)
        .use(rehypeSlug)
        .use(rehypeAutolinkHeadings, { behavior: "wrap" })
        .use(rehypeStringify)
        .process(value || "");
      if (!cancelled) setHtml(String(file));
    })();
    return () => {
      cancelled = true;
    };
  }, [value]);

  return (
    <div
      className="prose prose-neutral dark:prose-invert max-w-none prose-h2:scroll-mt-24 prose-figcaption:text-xs prose-figcaption:text-muted-foreground prose-figcaption:text-center"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

