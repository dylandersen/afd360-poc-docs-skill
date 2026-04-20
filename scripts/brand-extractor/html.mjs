// Zero-dep HTML scanner. Extracts just the subset of tags we need:
//   <meta ...>      <link ...>      <title>...</title>
//   <style>...</style>   <img ...>   inline <svg>...</svg>
//   <header>...</header> (to locate header-scoped images)
//
// This is not a real HTML parser. It works because we ask only about well-formed
// attributes of self-closing or short-form tags in <head>, plus a single scan of
// <header>...</header>. That covers every signal we care about.

const ATTR_RE = /([a-zA-Z_:][\w:.-]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g;

function parseAttrs(tagBody) {
  const attrs = {};
  let m;
  ATTR_RE.lastIndex = 0;
  while ((m = ATTR_RE.exec(tagBody))) {
    const name = m[1].toLowerCase();
    const value = m[3] ?? m[4] ?? m[5] ?? "";
    attrs[name] = value;
  }
  return attrs;
}

function findTags(html, tagName) {
  const out = [];
  const re = new RegExp(`<${tagName}\\b([^>]*)>`, "gi");
  let m;
  while ((m = re.exec(html))) {
    out.push({ attrs: parseAttrs(m[1] || ""), index: m.index });
  }
  return out;
}

function findBlock(html, tagName) {
  const re = new RegExp(`<${tagName}\\b([^>]*)>([\\s\\S]*?)</${tagName}>`, "gi");
  const out = [];
  let m;
  while ((m = re.exec(html))) {
    out.push({ attrs: parseAttrs(m[1] || ""), body: m[2] || "", index: m.index });
  }
  return out;
}

// Extract the full head region and (separately) the first <header> block if present.
function sliceRegions(html) {
  const headMatch = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i);
  const head = headMatch ? headMatch[1] : html;
  const headerMatch = html.match(/<header\b[^>]*>([\s\S]*?)<\/header>/i);
  const header = headerMatch ? headerMatch[0] : "";
  return { head, header };
}

export function parseDocument(html) {
  const { head, header } = sliceRegions(html);
  const metas = findTags(head, "meta").map((t) => t.attrs);
  const links = findTags(head, "link").map((t) => t.attrs);
  const titles = findBlock(head, "title").map((t) => t.body.trim());
  const styles = findBlock(head, "style").map((t) => t.body);
  const allImgs = findTags(html, "img").map((t) => ({ attrs: t.attrs, index: t.index }));
  const headerImgs = header ? findTags(header, "img").map((t) => t.attrs) : [];
  const headerSvgs = header
    ? (header.match(/<svg\b[\s\S]*?<\/svg>/gi) || [])
    : [];

  return {
    metas,
    links,
    title: titles[0] || null,
    styles,
    allImgs,
    headerImgs,
    headerSvgs,
    rawHeader: header,
  };
}

// Convenience: find a single meta by name or property.
export function metaContent(metas, key) {
  const lowKey = key.toLowerCase();
  const m = metas.find(
    (a) =>
      (a.name && a.name.toLowerCase() === lowKey) ||
      (a.property && a.property.toLowerCase() === lowKey) ||
      (a.itemprop && a.itemprop.toLowerCase() === lowKey)
  );
  return m ? (m.content ?? null) : null;
}

// Convenience: find link tags whose rel matches any token in the list.
export function linksByRel(links, rels) {
  const want = new Set(rels.map((r) => r.toLowerCase()));
  return links.filter((l) => {
    const rel = (l.rel || "").toLowerCase().split(/\s+/);
    return rel.some((r) => want.has(r));
  });
}
