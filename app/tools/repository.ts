// app/tools/repository.ts
//data access

import nodes from "@/data/nodes.json";

export type NodeType = {
  id: string;
  type?: string;
  slug: string;
  name: string;
  description?: string;

  parentIds?: string[];

  tags?: string[];

  status?: string;
  visibility?: string;

  metadata?: Record<string, any>;

  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };

  media?: {
    featuredImage?: string;
    gallery?: string[];
  };

  relationships?: {
    related?: string[];
  };
};

const safeNodes: NodeType[] = Array.isArray(nodes) ? (nodes as NodeType[]) : [];

/* ------------------------------------------------ */
/* BASIC NODE ACCESS */
/* ------------------------------------------------ */

// Lookup a single node by ID
export async function getNodeById(id: string): Promise<NodeType | null> {
  const node = safeNodes.find(
    (n) => n.id === id && n.status === "published"
  );

  return node ?? null;
}

// Lookup by slug (better for SEO URLs)
export async function getNodeBySlug(slug: string): Promise<NodeType | null> {
  const node = safeNodes.find(
    (n) => n.slug === slug && n.status === "published"
  );

  return node ?? null;
}

// Get all published nodes
export async function getAllNodes(): Promise<NodeType[]> {
  return safeNodes.filter((n) => n.status === "published");
}

/* ------------------------------------------------ */
/* CATEGORY / TREE NAVIGATION */
/* ------------------------------------------------ */

// Get children of a node
export async function getChildren(parentId: string): Promise<NodeType[]> {
  const nodes = await getAllNodes();

  return nodes.filter((n) => n.parentIds?.includes(parentId));
}

// Get parent nodes
export async function getParents(node: NodeType): Promise<NodeType[]> {
  if (!node.parentIds) return [];

  const nodes = await getAllNodes();

  return nodes.filter((n) => node.parentIds?.includes(n.id));
}

// Get nodes by type (category, place, article, etc.)
export async function getNodesByType(type: string): Promise<NodeType[]> {
  const nodes = await getAllNodes();

  return nodes.filter((n) => n.type === type);
}

//Get all descendant categories (recursive)
export async function getDescendantCategoryIds(parentId: string): Promise<string[]> {
  const nodes = await getAllNodes();

  const children = nodes.filter(n => 
    n.type === "category" && 
    n.parentIds?.includes(parentId)
  );

  let ids: string[] = [];

  for (const child of children) {
    ids.push(child.id);

    const subIds = await getDescendantCategoryIds(child.id);

    ids = [...ids, ...subIds];
  }

  return ids;
}

/* ------------------------------------------------ */
/* TAG SYSTEM */
/* ------------------------------------------------ */

// Get nodes with specific tag
export async function getNodesByTag(tag: string): Promise<NodeType[]> {
  const nodes = await getAllNodes();

  return nodes.filter((n) => n.tags?.includes(tag));
}

// Get all unique tags
export async function getAllTags(): Promise<string[]> {
  const nodes = await getAllNodes();

  const tags = new Set<string>();

  nodes.forEach((node) => {
    node.tags?.forEach((tag) => tags.add(tag));
  });

  return Array.from(tags);
}

/* ------------------------------------------------ */
/* RELATIONSHIPS */
/* ------------------------------------------------ */

// Get related nodes
export async function getRelatedNodes(node: NodeType): Promise<NodeType[]> {
  if (!node.relationships?.related) return [];

  const nodes = await getAllNodes();

  return nodes.filter((n) =>
    node.relationships?.related?.includes(n.id)
  );
}

/* ------------------------------------------------ */
/* SEARCH */
/* ------------------------------------------------ */

// simple search (name + description + tags)
export async function searchNodes(query: string): Promise<NodeType[]> {
  const nodes = await getAllNodes();

  const q = query.toLowerCase();

  return nodes.filter((n) =>
    n.name.toLowerCase().includes(q) ||
    n.description?.toLowerCase().includes(q) ||
    n.tags?.some((t) => t.toLowerCase().includes(q))
  );
}

/* ------------------------------------------------ */
/* BREADCRUMBS */
/* ------------------------------------------------ */

export async function getBreadcrumbs(node: NodeType): Promise<NodeType[]> {
  const nodes = await getAllNodes();

  const breadcrumbs: NodeType[] = [];
  let current = node;

  while (current.parentIds && current.parentIds.length > 0) {
    const parent = nodes.find((n) => n.id === current.parentIds![0]);

    if (!parent) break;

    breadcrumbs.push(parent);
    current = parent;
  }

  return breadcrumbs.reverse();
}

/* // Lookup a single node by ID OLLDDDDD
export async function getNodeById(id: string): Promise<NodeType | null> {
  console.log("getNodeById called with id:", id);

  if (!nodes || !Array.isArray(nodes)) {
    console.error("ERROR: nodes is not an array!", nodes);
    return null;
  }

  console.log("Total nodes loaded:", nodes.length);

  const node = nodes.find((n) => {
    const match = n.id === id && n.status === "published";
    if (match) {
      console.log("MATCH FOUND:", n);
    }
    return match;
  });

  if (!node) {
    console.warn(`No published node found for id: ${id}`);
  }

  return node ?? null;
}

// Get all published nodes
export async function getAllNodes(): Promise<NodeType[]> {
  if (!nodes || !Array.isArray(nodes)) {
    console.error("ERROR: nodes is not an array!", nodes);
    return [];
  }

  const publishedNodes = nodes.filter((n) => n.status === "published");

  console.log("getAllNodes found", publishedNodes.length, "published nodes");

  publishedNodes.forEach((n, i) => {
    console.log(`Node[${i}] => id: ${n.id}, name: ${n.name}`);
  });

  return publishedNodes;
} */