import { createFileRoute } from "@tanstack/react-router";
import { checkRateLimit } from "@/lib/rate-limit";

interface CrossRefAuthor {
  given?: string;
  family?: string;
  name?: string;
}

interface CrossRefMessage {
  title?: string[];
  author?: CrossRefAuthor[];
  "container-title"?: string[];
  published?: { "date-parts"?: number[][] };
  "published-print"?: { "date-parts"?: number[][] };
  "published-online"?: { "date-parts"?: number[][] };
  volume?: string;
  issue?: string;
  page?: string;
  publisher?: string;
  DOI?: string;
  URL?: string;
  type?: string;
  abstract?: string;
}

function formatAuthorsAPA(authors?: CrossRefAuthor[]): string {
  if (!authors || authors.length === 0) return "Unknown Author";
  if (authors.length === 1) {
    const a = authors[0];
    return a.family && a.given ? `${a.family}, ${a.given[0]}.` : a.family || a.name || "Unknown Author";
  }
  if (authors.length === 2) {
    const a1 = authors[0];
    const a2 = authors[1];
    const f1 = a1.family && a1.given ? `${a1.family}, ${a1.given[0]}.` : a1.family || a1.name || "";
    const f2 = a2.family && a2.given ? `${a2.family}, ${a2.given[0]}.` : a2.family || a2.name || "";
    return `${f1}, & ${f2}`;
  }
  const first = authors[0];
  const f1 = first.family && first.given ? `${first.family}, ${first.given[0]}.` : first.family || first.name || "";
  return `${f1}, et al.`;
}

function formatAuthorsMLA(authors?: CrossRefAuthor[]): string {
  if (!authors || authors.length === 0) return "Unknown Author";
  if (authors.length === 1) {
    const a = authors[0];
    return a.family && a.given ? `${a.family}, ${a.given}` : a.family || a.name || "Unknown Author";
  }
  if (authors.length === 2) {
    const a1 = authors[0];
    const a2 = authors[1];
    const f1 = a1.family && a1.given ? `${a1.family}, ${a1.given}` : a1.family || a1.name || "";
    const f2 = a2.given && a2.family ? `${a2.given} ${a2.family}` : a2.family || a2.name || "";
    return `${f1}, and ${f2}`;
  }
  const first = authors[0];
  const f1 = first.family && first.given ? `${first.family}, ${first.given}` : first.family || first.name || "";
  return `${f1}, et al.`;
}

function formatAuthorsIEEE(authors?: CrossRefAuthor[]): string {
  if (!authors || authors.length === 0) return "Unknown Author";
  const list = authors.map((a) => {
    if (a.given && a.family) {
      return `${a.given[0]}. ${a.family}`;
    }
    return a.family || a.name || "";
  });
  if (list.length > 3) {
    return `${list[0]} et al.`;
  }
  return list.join(", ");
}

function getYear(msg: CrossRefMessage): string {
  const parts =
    msg.published?.["date-parts"]?.[0] ||
    msg["published-print"]?.["date-parts"]?.[0] ||
    msg["published-online"]?.["date-parts"]?.[0];
  return parts && parts[0] ? String(parts[0]) : "n.d.";
}

export const Route = createFileRoute("/api/doi-citation")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rate = checkRateLimit(request, 40, 60 * 1000);
        if (!rate.ok) {
          return Response.json(
            { error: "داواکارییەکان لە سنوور تێپەڕیوە. تکایە کەمێکی تر چاوەڕێ بکە." },
            { status: 429 },
          );
        }

        try {
          const { doi } = (await request.json()) as { doi?: string };
          if (!doi || typeof doi !== "string" || !doi.trim()) {
            return Response.json({ error: "تکایە ژمارەی DOI بنووسە." }, { status: 400 });
          }

          // Clean DOI
          let cleanDoi = doi.trim();
          cleanDoi = cleanDoi.replace(/^https?:\/\/(dx\.)?doi\.org\//i, "");
          cleanDoi = cleanDoi.replace(/^doi:/i, "").trim();

          const crossRefUrl = `https://api.crossref.org/works/${encodeURIComponent(cleanDoi)}`;
          const res = await fetch(crossRefUrl, {
            headers: {
              "User-Agent": "LasAIAcademic/1.0 (mailto:sangarduhok@gmail.com)",
            },
          });

          if (!res.ok) {
            return Response.json(
              { error: "ئەم ژمارەی DOI نەدۆزرایەوە. تکایە دڵنیابە لە دروستی ژمارەکە." },
              { status: 404 },
            );
          }

          const data = (await res.json()) as { message?: CrossRefMessage };
          const msg = data.message;
          if (!msg) {
            return Response.json({ error: "زانیاری توێژینەوەکە بەردەست نییە." }, { status: 404 });
          }

          const title = msg.title?.[0] || "Untitled";
          const journal = msg["container-title"]?.[0] || msg.publisher || "Academic Publication";
          const year = getYear(msg);
          const volume = msg.volume || "";
          const issue = msg.issue || "";
          const pages = msg.page || "";
          const publisher = msg.publisher || "";
          const doiUrl = msg.URL || `https://doi.org/${cleanDoi}`;

          // Format Authors
          const apaAuthors = formatAuthorsAPA(msg.author);
          const mlaAuthors = formatAuthorsMLA(msg.author);
          const ieeeAuthors = formatAuthorsIEEE(msg.author);
          const firstAuthorFamily = msg.author?.[0]?.family || "Author";

          // Citations
          const volIssue = volume && issue ? `${volume}(${issue})` : volume || issue || "";
          const pagesPart = pages ? `, ${pages}` : "";

          // APA 7th
          const apa = `${apaAuthors} (${year}). ${title}. ${journal}${volIssue ? `, ${volIssue}` : ""}${pagesPart}. ${doiUrl}`;

          // MLA 9th
          const mla = `${mlaAuthors}. "${title}." ${journal}${volume ? `, vol. ${volume}` : ""}${issue ? `, no. ${issue}` : ""}, ${year}${pages ? `, pp. ${pages}` : ""}. DOI.org, ${doiUrl}.`;

          // Chicago 17th
          const chicago = `${apaAuthors} "${title}." ${journal} ${volume}${issue ? `, no. ${issue}` : ""} (${year})${pages ? `: ${pages}` : ""}. ${doiUrl}.`;

          // Harvard
          const harvard = `${apaAuthors}, ${year}. ${title}. ${journal}, ${volIssue ? `${volIssue}` : ""}${pages ? `, pp.${pages}` : ""}. Available at: <${doiUrl}>.`;

          // IEEE
          const ieee = `${ieeeAuthors}, "${title}," ${journal}${volume ? `, vol. ${volume}` : ""}${issue ? `, no. ${issue}` : ""}${pages ? `, pp. ${pages}` : ""}, ${year}, doi: ${cleanDoi}.`;

          // In-Text Citation (APA)
          const inText = `(${firstAuthorFamily}, ${year})`;

          // BibTeX
          const citeKey = `${firstAuthorFamily.toLowerCase().replace(/[^a-z0-9]/g, "")}${year}${title.slice(0, 4).toLowerCase().replace(/[^a-z0-9]/g, "")}`;
          const bibAuthors = msg.author?.map((a) => `${a.family || ""}, ${a.given || ""}`).join(" and ") || "Unknown";

          const bibtex = `@article{${citeKey},
  author = {${bibAuthors}},
  title = {${title}},
  journal = {${journal}},
  year = {${year}},
  volume = {${volume}},
  number = {${issue}},
  pages = {${pages}},
  doi = {${cleanDoi}},
  publisher = {${publisher}}
}`;

          return Response.json({
            success: true,
            data: {
              title,
              journal,
              year,
              authors: msg.author || [],
              volume,
              issue,
              pages,
              publisher,
              doi: cleanDoi,
              doiUrl,
              citations: {
                apa,
                mla,
                chicago,
                harvard,
                ieee,
                inText,
                bibtex,
              },
            },
          });
        } catch (err: any) {
          console.error("DOI resolution error:", err);
          return Response.json(
            { error: "هەڵەیەک لە وەرگرتنی داتای DOI ڕوویدا: " + (err.message || "Unknown error") },
            { status: 500 },
          );
        }
      },
    },
  },
});
