#!/usr/bin/env python3
"""Dependency-free smoke checks for the Bazaar Art GitHub Pages repository."""
from html.parser import HTMLParser
from pathlib import Path
import json
import re
import sys
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
errors = []
warnings = []

class AuditParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids = []
        self.refs = []
        self.csp = None
        self.inline_scripts = 0
        self.script_srcs = []
        self.inline_event_handlers = []
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if a.get("id"):
            self.ids.append(a["id"])
        if tag in ("script", "img", "source", "audio", "video", "link"):
            ref = a.get("src") or (a.get("href") if tag == "link" else None)
            if ref:
                self.refs.append(ref)
        if tag == "script":
            if a.get("src"):
                self.script_srcs.append(a["src"])
            else:
                self.inline_scripts += 1
        for key in a:
            if key and key.lower().startswith("on"):
                self.inline_event_handlers.append((tag, key))
        if tag == "meta" and a.get("http-equiv", "").lower() == "content-security-policy":
            self.csp = a.get("content", "")

def local_target(ref, source_file):
    parsed = urlparse(ref)
    if parsed.scheme or parsed.netloc or ref.startswith(("#", "data:", "blob:", "mailto:", "tel:", "javascript:")):
        return None
    path = parsed.path
    if not path:
        return None
    source_path = Path(source_file)\n    target = (ROOT / path.lstrip("/")) if path.startswith("/") else (ROOT / source_path.parent / path_obj)
    target = target.resolve()
    if target.is_dir():
        target = target / "index.html"
    return target

def audit_html(path):
    parser = AuditParser()
    try:
        parser.feed(path.read_text(encoding="utf-8"))
        parser.close()
    except Exception as exc:
        errors.append(f"{path.relative_to(ROOT)}: HTML parser error: {exc}")
        return
    duplicates = sorted({x for x in parser.ids if parser.ids.count(x) > 1})
    if duplicates:
        errors.append(f"{path.relative_to(ROOT)}: duplicate id(s): {', '.join(duplicates)}")
    for ref in parser.refs:
        target = local_target(ref, path)
        if target and not target.exists():
            errors.append(f"{path.relative_to(ROOT)}: missing local asset: {ref}")
    if path == ROOT / "index.html":
        if not parser.csp:
            errors.append("index.html: Content-Security-Policy meta tag is missing")
        else:
            for directive in ("default-src", "object-src", "base-uri", "form-action"):
                if not re.search(r"(?:^|;)\s*" + re.escape(directive) + r"\b", parser.csp):
                    errors.append(f"index.html: CSP directive {directive} is missing")
            if "'unsafe-eval'" in parser.csp:
                errors.append("index.html: CSP contains unsafe-eval")
        if parser.inline_event_handlers:
            errors.append(f"index.html: inline event-handler attributes found ({len(parser.inline_event_handlers)}); migrate before tightening style/script CSP")
        if parser.inline_scripts:
            warnings.append(f"index.html: {parser.inline_scripts} inline script block(s) remain; strict script-src requires extraction or a nonce/hash strategy")
        if "'unsafe-inline'" in (parser.csp or ""):
            warnings.append("index.html: CSP allows unsafe-inline; assess after inline code/styles are migrated")

def main():
    manifest = ROOT / "mentor-manifest.json"
    try:
        json.loads(manifest.read_text(encoding="utf-8"))
    except Exception as exc:
        errors.append(f"mentor-manifest.json: invalid JSON: {exc}")
    for path in sorted(ROOT.rglob("*.html")):
        if ".git" in path.parts or "node_modules" in path.parts:
            continue
        audit_html(path)
    print(f"Audited HTML files: {sum(1 for p in ROOT.rglob('*.html') if '.git' not in p.parts and 'node_modules' not in p.parts)}")
    for message in warnings:
        print(f"WARNING: {message}")
    for message in errors:
        print(f"ERROR: {message}")
    print(f"Result: {len(errors)} error(s), {len(warnings)} warning(s)")
    return 1 if errors else 0

if __name__ == "__main__":
    sys.exit(main())
