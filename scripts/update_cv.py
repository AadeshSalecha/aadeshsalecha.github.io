#!/usr/bin/env python3
"""Refreshes the citation-stats and publications blocks in cv/aadesh-salecha-cv.tex
from the author's Google Scholar profile, in place between AUTOGEN markers.

Google Scholar has no official API — this scrapes the public profile page via the
`scholarly` package, which datacenter IPs (like CI runners) sometimes get CAPTCHA'd
by. On failure this exits nonzero and leaves the .tex untouched, rather than writing
partial/garbage data; the next scheduled run tries again.
"""

import re
import sys
from pathlib import Path

from scholarly import scholarly

SCHOLAR_ID = "Cnwzl3oAAAAJ"
CV_PATH = Path(__file__).resolve().parent.parent / "cv" / "aadesh-salecha-cv.tex"
MAX_PUBLICATIONS = 12

LATEX_ESCAPES = {
    "&": r"\&", "%": r"\%", "$": r"\$", "#": r"\#", "_": r"\_",
    "{": r"\{", "}": r"\}", "~": r"\textasciitilde{}", "^": r"\textasciicircum{}",
    "\\": r"\textbackslash{}",
}


def latex_escape(text):
    return "".join(LATEX_ESCAPES.get(ch, ch) for ch in text)


def replace_block(content, marker, new_body):
    start, end = f"% AUTOGEN:{marker}:START", f"% AUTOGEN:{marker}:END"
    pattern = re.compile(re.escape(start) + r".*?" + re.escape(end), re.DOTALL)
    if not pattern.search(content):
        raise ValueError(f"Could not find {marker} markers in {CV_PATH}")
    # Use a callable replacement — a string replacement would have re.sub()
    # interpret the LaTeX backslashes (\quad, \textbf, ...) as regex escapes.
    return pattern.sub(lambda _m: f"{start}\n{new_body}\n{end}", content)


def build_stats_block(author):
    citedby = author.get("citedby", "?")
    hindex = author.get("hindex", "?")
    i10index = author.get("i10index", "?")
    return (
        rf"\textbf{{{citedby}}} citations \quad $\cdot$ \quad "
        rf"\textbf{{{hindex}}} h-index \quad $\cdot$ \quad "
        rf"\textbf{{{i10index}}} i10-index \quad "
        r"{\small(Google Scholar, updated automatically)}"
    )


def build_publications_block(publications):
    pubs = sorted(publications, key=lambda p: p.get("num_citations") or 0, reverse=True)
    lines = [r"\begin{itemize}[leftmargin=*, itemsep=0.15em]"]
    for pub in pubs[:MAX_PUBLICATIONS]:
        bib = pub.get("bib", {})
        title = latex_escape(bib.get("title") or "Untitled")
        year = latex_escape(str(bib.get("pub_year") or ""))
        citation = latex_escape(bib.get("citation") or "")
        cites = pub.get("num_citations") or 0
        lines.append(
            rf"  \item \textbf{{{title}}} ({year}). {citation} \hfill \textit{{{cites} citations}}"
        )
    lines.append(r"\end{itemize}")
    return "\n".join(lines)


def main():
    content = CV_PATH.read_text()

    print(f"Fetching Google Scholar profile {SCHOLAR_ID}...")
    author = scholarly.search_author_id(SCHOLAR_ID, filled=True)

    content = replace_block(content, "STATS", build_stats_block(author))
    content = replace_block(
        content, "PUBLICATIONS", build_publications_block(author.get("publications", []))
    )

    CV_PATH.write_text(content)
    print(f"Updated {CV_PATH} — {author.get('citedby')} citations, "
          f"{len(author.get('publications', []))} publications fetched.")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:  # noqa: BLE001 — scraping is inherently flaky; fail loud, change nothing
        print(f"CV update skipped — Google Scholar fetch failed: {exc}", file=sys.stderr)
        sys.exit(1)
