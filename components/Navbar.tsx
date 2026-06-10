// components/Navbar.tsx
// Server component — pulls nodes once and passes them to the
// (client) NavbarClient so the search box has its dataset.

import { getAllNodes } from "@/app/tools/repository";
import { siteConfig } from "@/lib/siteConfig";
import NavbarClient from "./NavbarClient";

export default async function Navbar() {
  const nodes = await getAllNodes();
  return (
    <NavbarClient
      nodes={nodes}
      brand={siteConfig.shortName}
      nav={siteConfig.primaryNav}
      searchPlaceholder={siteConfig.search.placeholder}
    />
  );
}
