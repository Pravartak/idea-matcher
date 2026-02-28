"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

type AdSenseProps = {
  pId: string;
};

export function AdSense({ pId }: AdSenseProps) {
  const pathname = usePathname();

  // Add the paths you want to exclude here.
  // AdSense often flags login/signup pages or pages with little text content.
  // The goal is to only show ads on pages with rich, crawlable, public content.
  const excludedPaths = [

    // Auth pages have no content for crawlers.
    "/login",
    "/signup",
    "/onboarding",

    // These pages require login and are not accessible to crawlers.
    "/chats",
    "/notifications",

    // These are utility/form pages, not content pages, which violates AdSense policy.
    "/create-post",
    "/settings",

    // Exclude pages with dummy content to avoid "Valuable Inventory" violations
    "/projects",
    "/hackathon-teams",
  ];

  const isExcluded = pathname && excludedPaths.some((path) => {
    // Exact match for root, prefix match for others (e.g. /onboarding/profile)
    return path === "/" ? pathname === "/" : pathname === path || pathname.startsWith(`${path}/`);
  });

  useEffect(() => {
    if (isExcluded) return;
    if (document.querySelector(`script[src*="adsbygoogle.js"]`)) return;

    const script = document.createElement("script");
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${pId}`;
    script.async = true;
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);
  }, [pId, isExcluded]);

  return null;
}
