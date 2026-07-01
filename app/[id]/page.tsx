// app/[id]/page.tsx

import { notFound } from "next/navigation";
import Link from "next/link";

import {
  getNodeById,
  getAllNodes,
  getChildren,
  getBreadcrumbs,
  NodeType,
  getDescendantCategoryIds,
} from "@/app/tools/repository";
import { generateNodeMetadata } from "@/app/tools/seo";
import TagChip from "@/components/TagChip";

// ===== [HTML-CONTENT FEATURE] =====================================
// Imports below are only used by the .html fallback loader.
// Safe to delete this entire block + the .html branch in
// loadContentComponent() to fully disable the feature.
import { readFile } from "fs/promises";
import path from "path";
import Script from "next/script";
const ENABLE_HTML_CONTENT = true; // flip to false to disable .html loading
// ==================================================================

type Props = { params: Promise<{ id: string }> };

/* --------- static generation --------- */
export async function generateStaticParams() {
  const nodes = await getAllNodes();
  return nodes.map((node) => ({ id: node.id }));
}

/* --------- SEO --------- */
export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return generateNodeMetadata(id);
}

/* --------- custom content loader --------- */
async function loadContentComponent(id: string) {
  // Original behavior: load a .tsx React component from app/content/{id}.tsx
  try {
    const mod = await import(`@/app/content/${id}`);
    return mod.default;
  } catch {
    // fall through to HTML fallback (if enabled)
  }

  // ===== [HTML-CONTENT FEATURE] ===================================
  // Fallback: load a raw .html body fragment from app/content/{id}.html.
  // Runs only at build time (output: 'export'), so SEO/SSG is preserved.
  // Any <script> tags found in the file are extracted and re-emitted via
  // next/script so client-side tools (e.g. calculators) actually execute.
  // To disable: set ENABLE_HTML_CONTENT = false above, or delete this block.
  if (ENABLE_HTML_CONTENT) {
    try {
      const html = await readFile(
        path.join(process.cwd(), "app/content", `${id}.html`),
        "utf8",
      );
      const { body, scripts } = extractScripts(html);
      const HtmlContent = function HtmlContent() {
        return (
          <>
            <div dangerouslySetInnerHTML={{ __html: body }} />
            {scripts.map((s, i) =>
              s.src ? (
                <Script key={i} src={s.src} strategy="afterInteractive" />
              ) : (
                <Script
                  key={i}
                  id={`content-script-${id}-${i}`}
                  strategy="afterInteractive"
                  dangerouslySetInnerHTML={{ __html: s.code }}
                />
              ),
            )}
          </>
        );
      };
      return HtmlContent;
    } catch {
      // no .html file either
    }
  }
  // ================================================================

  return null;
}

// ===== [HTML-CONTENT FEATURE] =====================================
// Helper: strip <script>...</script> blocks out of the raw HTML so they
// can be re-emitted as <Script> tags (raw <script> inside
// dangerouslySetInnerHTML does NOT execute). Safe to delete with the
// rest of the feature.
function extractScripts(html: string) {
  const scripts: { src?: string; code: string }[] = [];
  const body = html.replace(
    /<script\b([^>]*)>([\s\S]*?)<\/script>/gi,
    (_, attrs: string, code: string) => {
      const src = /\bsrc\s*=\s*["']([^"']+)["']/i.exec(attrs)?.[1];
      scripts.push({ src, code });
      return "";
    },
  );
  return { body, scripts };
}
// ==================================================================

async function getItemsForCategoryTree(categoryId: string): Promise<NodeType[]> {
  const nodes = await getAllNodes();
  const descendantIds = await getDescendantCategoryIds(categoryId);
  const allCategoryIds = [categoryId, ...descendantIds];
  return nodes.filter(
    (n) =>
      n.type !== "category" &&
      n.parentIds?.some((id) => allCategoryIds.includes(id)),
  );
}

/* --------- page --------- */
export default async function NodePage({ params }: Props) {
  const { id } = await params;
  const node = await getNodeById(id);
  if (!node) return notFound();

  const isCategory = node.type === "category";
  const children = await getChildren(id);
  const breadcrumbs = await getBreadcrumbs(node);
  const categories = children.filter((c) => c.type === "category");
  const pages = isCategory ? await getItemsForCategoryTree(id) : [];
  const ContentComponent = await loadContentComponent(id);

  return (
    <main className="mx-auto max-w-7xl px-5 sm:px-6 py-8 sm:py-10">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex flex-wrap items-center gap-1 text-sm text-gray-500">
        <Link href="/category/" className="hover:text-gray-900">
          Home
        </Link>
        {breadcrumbs.map((crumb) => (
          <span key={crumb.id} className="flex items-center gap-1">
            <Separator />
            <Link href={`/${crumb.id}`} className="hover:text-gray-900">
              {crumb.name}
            </Link>
          </span>
        ))}
        <span className="flex items-center gap-1">
          <Separator />
          <span className="text-gray-900">{node.name}</span>
        </span>
      </nav>

      {/* Title block for non-content pages, or rich content body for detail pages */}
      {ContentComponent ? (
        <section className="docs">
          <ContentComponent node={node} />
          {node.tags && node.tags.length > 0 && (
            <div className="not-prose mt-10 flex flex-wrap gap-1.5">
              {node.tags.map((t) => (
                <TagChip key={t} label={t} />
              ))}
            </div>
          )}
        </section>
      ) : (
        <>
          <header className="mb-10">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              {node.name}
            </h1>
            {node.description && (
              <p className="mt-3 max-w-2xl text-gray-600">{node.description}</p>
            )}
            {node.tags && node.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {node.tags.map((t) => (
                  <TagChip key={t} label={t} />
                ))}
              </div>
            )}
          </header>

          {/* Subcategories */}
          {categories.length > 0 && (
            <section className="mb-12">
              <h2 className="mb-4 text-lg font-semibold tracking-tight">
                Subcategories
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/${cat.id}`}
                    className="group block rounded-2xl border border-gray-100 bg-white p-5 ring-soft transition hover:border-gray-200"
                  >
                    <h3 className="font-medium text-gray-900 group-hover:text-eng-navy">
                      {cat.name}
                    </h3>
                    {cat.description && (
                      <p className="mt-1 text-sm text-gray-600">
                        {cat.description}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Items in this category (recursive) */}
          {pages.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-semibold tracking-tight">
                In this category
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {pages.map((page) => (
                  <Link
                    key={page.id}
                    href={`/${page.id}`}
                    className="group block rounded-2xl border border-gray-100 bg-white p-4 ring-soft transition hover:border-gray-200"
                  >
                    <h3 className="font-medium text-gray-900 group-hover:text-eng-navy">
                      {page.name}
                    </h3>
                    {page.description && (
                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                        {page.description}
                      </p>
                    )}
                    {page.tags && page.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {page.tags.slice(0, 4).map((t) => (
                          <TagChip key={t} label={t} />
                        ))}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}

function Separator() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-gray-300" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
