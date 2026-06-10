import Link from "next/link";
import { getAllNodes } from "@/app/tools/repository";

export const metadata = { title: "Categories" };

export default async function CategoryIndex() {
  const nodes = await getAllNodes();

  const rootCategories = nodes.filter(
    (n) => n.type === "category" && (!n.parentIds || n.parentIds.length === 0),
  );

  // count items inside each root category (incl. descendants)
  const childCount: Record<string, number> = {};
  function countDescendants(catId: string): number {
    const children = nodes.filter(
      (n) => n.type === "category" && n.parentIds?.includes(catId),
    );
    const directItems = nodes.filter(
      (n) => n.type !== "category" && n.parentIds?.includes(catId),
    ).length;
    const childItems = children.reduce(
      (acc, c) => acc + countDescendants(c.id),
      0,
    );
    return directItems + childItems;
  }
  rootCategories.forEach((c) => (childCount[c.id] = countDescendants(c.id)));

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <header className="mb-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-eng-navy">
          Browse
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight">
          All categories
        </h1>
        <p className="mt-3 text-gray-600">
          Top-level categories — click in to see everything inside.
        </p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {rootCategories.map((cat) => (
          <Link
            key={cat.id}
            href={`/${cat.id}`}
            className="group relative block rounded-2xl border border-gray-100 bg-white p-6 ring-soft transition hover:-translate-y-0.5 hover:border-gray-200"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-semibold text-gray-900 group-hover:text-eng-navy">
                {cat.name}
              </h2>
              <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">
                {childCount[cat.id] ?? 0}
              </span>
            </div>
            {cat.description && (
              <p className="mt-2 text-sm text-gray-600">{cat.description}</p>
            )}
            <div className="mt-4 inline-flex items-center text-sm font-medium text-eng-navy">
              Explore
              <svg
                viewBox="0 0 24 24"
                className="ml-1 h-3.5 w-3.5 transition group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
              >
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
