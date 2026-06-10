import { Suspense } from "react";
import { getAllNodes, getAllTags } from "@/app/tools/repository";
import SearchClient from "./SearchClient";

export const metadata = {
  title: "Search",
};

export default async function SearchPage() {
  const nodes = await getAllNodes();
  const tags = await getAllTags();

  const items = nodes.filter((n) => n.type !== "category");
  const categories = nodes.filter((n) => n.type === "category");

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          Search & explore
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Filter by category, tag, or keyword.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="rounded-2xl border border-gray-100 bg-white p-10 text-sm text-gray-500">
            Loading search…
          </div>
        }
      >
        <SearchClient nodes={items} tags={tags} categories={categories} />
      </Suspense>
    </main>
  );
}
