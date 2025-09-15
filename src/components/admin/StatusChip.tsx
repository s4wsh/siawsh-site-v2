export default function StatusChip({ status }: { status: 'draft' | 'published' | string }) {
  const isPub = status === 'published';
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] ${isPub ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200'}`}>
      {isPub ? 'Published' : 'Draft'}
    </span>
  );
}

