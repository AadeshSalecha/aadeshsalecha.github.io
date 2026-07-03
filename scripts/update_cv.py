#!/usr/bin/env python3
"""Refreshes resume/cv/publications_harvard.tex from the author's Google Scholar
profile: the citations-per-year chart, the Highlights metrics table, and a
(commented-out) holding list of any new publications not yet found anywhere
else in the file. Everything else in the CV — education, experience, the
hand-curated publication categories/labels — is left untouched.

Google Scholar has no official API — this scrapes the public profile page via
the `scholarly` package, which datacenter IPs (like CI runners) sometimes get
CAPTCHA'd by. On failure this exits nonzero and leaves the .tex untouched,
rather than writing partial/garbage data; the next scheduled run tries again.
"""

import difflib
import re
import sys
from pathlib import Path

from scholarly import scholarly

SCHOLAR_ID = "Cnwzl3oAAAAJ"
TEX_PATH = Path(__file__).resolve().parent.parent / "resume" / "cv" / "publications_harvard.tex"

# Matches the title text inside \cvpub{\textbf{\bodyfontlight <title>\\ ...
TITLE_RE = re.compile(r"\\cvpub\{\\textbf\{\\bodyfontlight\s+(.+?)\\\\", re.DOTALL)

LATEX_ESCAPES = {
    "&": r"\&", "%": r"\%", "$": r"\$", "#": r"\#", "_": r"\_",
    "{": r"\{", "}": r"\}", "~": r"\textasciitilde{}", "^": r"\textasciicircum{}",
    "\\": r"\textbackslash{}",
}


def latex_escape(text):
    return "".join(LATEX_ESCAPES.get(ch, ch) for ch in text)


def normalize_title(title):
    return re.sub(r"[^a-z0-9]+", "", title.lower())


def replace_block(content, marker, new_body):
    start, end = f"% AUTOGEN:{marker}:START", f"% AUTOGEN:{marker}:END"
    pattern = re.compile(re.escape(start) + r".*?" + re.escape(end), re.DOTALL)
    if not pattern.search(content):
        raise ValueError(f"Could not find {marker} markers in {TEX_PATH}")
    # Callable replacement — a string replacement would have re.sub() interpret
    # the LaTeX backslashes (\addplot, \textbf, ...) as regex escapes.
    return pattern.sub(lambda _m: f"{start}\n{new_body}\n{end}", content)


def build_chart_block(cites_per_year):
    years = sorted(cites_per_year)
    coord_years = ",".join(str(y) for y in years)
    coords = " ".join(f"({y},{cites_per_year[y]})" for y in years)
    return (
        f"        symbolic x coords={{{coord_years}}},\n"
        f"    ]\n"
        f"    \\addplot coordinates {{{coords}}};"
    )


def build_metrics_block(citedby, num_publications, hindex):
    return (
        f"        \\textbf{{\\bodyfontlight Total Publications:}}       &  {num_publications}  \\\\\n"
        f"        \\textbf{{\\bodyfontlight Total citations:}} & {citedby} \\\\\n"
        f"        \\textbf{{\\bodyfontlight h-index:}}         & {hindex}  \\\\"
    )


def build_newpubs_block(publications, known_titles):
    header = (
        "% New Google Scholar publications not matched (by title) to anything else in this file.\n"
        "% Move each into the right section above with its own \\label and citation style, then\n"
        "% delete it from this block. (Left commented out so it never renders on its own.)"
    )
    entries = []
    for pub in publications:
        bib = pub.get("bib", {})
        title = (bib.get("title") or "").strip()
        if not title:
            continue
        norm = normalize_title(title)
        if norm in known_titles or difflib.get_close_matches(norm, known_titles, n=1, cutoff=0.85):
            continue
        year = bib.get("pub_year", "")
        citation = bib.get("citation", "")
        cites = pub.get("num_citations", 0)
        entries.append(
            f"% \\item \\cvpub{{\\textbf{{\\bodyfontlight {latex_escape(title)}\\\\ }} "
            f"({year}). {latex_escape(citation)}}} % {cites} citations"
        )
    if not entries:
        return header + "\n% (none detected as of the last run)"
    return header + "\n" + "\n".join(entries)


def main():
    content = TEX_PATH.read_text()
    known_titles = {normalize_title(m.group(1)) for m in TITLE_RE.finditer(content)}

    print(f"Fetching Google Scholar profile {SCHOLAR_ID}...")
    author = scholarly.search_author_id(SCHOLAR_ID, filled=True)

    citedby = author.get("citedby", 0)
    hindex = author.get("hindex", 0)
    publications = author.get("publications", [])
    cites_per_year = author.get("cites_per_year") or {}

    if not cites_per_year:
        raise ValueError("Scholar profile returned no cites_per_year data — refusing to overwrite the chart")

    content = replace_block(content, "CHART", build_chart_block(cites_per_year))
    content = replace_block(content, "METRICS", build_metrics_block(citedby, len(publications), hindex))
    content = replace_block(content, "NEWPUBS", build_newpubs_block(publications, known_titles))

    TEX_PATH.write_text(content)
    print(f"Updated {TEX_PATH} — {citedby} citations, {hindex} h-index, "
          f"{len(publications)} total publications on Scholar.")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:  # noqa: BLE001 — scraping is inherently flaky; fail loud, change nothing
        print(f"CV update skipped — Google Scholar fetch failed: {exc}", file=sys.stderr)
        sys.exit(1)
