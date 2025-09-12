export function GET() {
  return new Response(
    `User-agent: *
Allow: /
Disallow: /admin
`,
    { headers: { "Content-Type": "text/plain" } }
  );
}
