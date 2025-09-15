const tokens = new Map<string, { type: 'project' | 'post', id: string, exp: number }>();

export function mintPreviewToken(type: 'project' | 'post', id: string): string {
  const token = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  tokens.set(token, { type, id, exp: Date.now() + 5 * 60 * 1000 }); // 5 minutes
  return token;
}

export function consumePreviewToken(token: string): { type: 'project' | 'post', id: string } | null {
  const e = tokens.get(token);
  if (!e) return null;
  tokens.delete(token);
  if (Date.now() > e.exp) return null;
  return { type: e.type, id: e.id };
}

