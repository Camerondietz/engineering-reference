import Link from "next/link";
import Image from "next/image";
import { repo } from "@/lib/constants";

interface Props {
  title: string;
  category: string;
  image: string;
  href: string;
}

export default function FeaturedCard({ title, category, image, href }: Props) {
  return (
    <Link
      href={href}
      className="group relative block overflow-hidden rounded-3xl ring-soft transition duration-300 hover:-translate-y-0.5"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-gray-100">
        <Image
          src={`${repo}${image}`}
          alt={title}
          fill
          sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
          className="object-cover transition duration-700 group-hover:scale-105"
        />
        {/* Bottom gradient overlay for legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
      </div>

      <div className="absolute inset-x-0 bottom-0 p-5 text-white">
        <span className="inline-block rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider backdrop-blur-md">
          {category}
        </span>
        <h3 className="mt-3 text-xl font-semibold leading-tight tracking-tight drop-shadow-sm">
          {title}
        </h3>
      </div>
    </Link>
  );
}
