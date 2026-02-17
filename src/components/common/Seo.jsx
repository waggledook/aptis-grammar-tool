// src/components/common/Seo.jsx
import { useEffect } from "react";

function upsertMeta(selector, attrs) {
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement("meta");
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    document.head.appendChild(el);
  }
  return el;
}

function upsertLink(rel, href) {
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export default function Seo({ title, description, canonical }) {
  useEffect(() => {
    const url = canonical || window.location.href;

    if (title) document.title = title;

    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", "description");
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", description);
    }

    // Canonical
    upsertLink("canonical", url);

    // Open Graph
    if (title) upsertMeta('meta[property="og:title"]', { property: "og:title" }).setAttribute("content", title);
    if (description) upsertMeta('meta[property="og:description"]', { property: "og:description" }).setAttribute("content", description);
    upsertMeta('meta[property="og:url"]', { property: "og:url" }).setAttribute("content", url);

    // Twitter
    if (title) upsertMeta('meta[name="twitter:title"]', { name: "twitter:title" }).setAttribute("content", title);
    if (description) upsertMeta('meta[name="twitter:description"]', { name: "twitter:description" }).setAttribute("content", description);
  }, [title, description, canonical]);

  return null;
}
