/** Admin field-note routes use the rich editor — skip static prerender at build time. */
export const dynamic = 'force-dynamic';

export default function AdminFieldNotesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
