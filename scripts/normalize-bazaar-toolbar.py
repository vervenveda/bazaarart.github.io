#!/usr/bin/env python3
from pathlib import Path
import json,re
ROOT=Path(__file__).resolve().parents[1]
REPORT=ROOT/"tests/bazaar-toolbar-sync-report.json"
ROUTER="https://vervenveda.com/bazaarart.github.io/assets/bazaar-page-tools.js?v=1.0.0"
TRANSLATOR="https://vervenveda.com/Khaemenes_Linguistics.github.io/assets/khaemenes-translator-loader.js?v=1.1.1"
LANGUAGE="https://vervenveda.com/assets/vnv-language.js?v=20261121-half-height"
CLASS_TOOLS="https://vervenveda.com/assets/vnv-class-tools-toolbar.js?v=1.6.1"

def tag(src): return f'<script src="{src}" defer></script>'
def strip_named(s,needle):
    return re.sub(r'<script\b[^>]*src=["\'][^"\']*'+re.escape(needle)+r'[^"\']*["\'][^>]*>\s*</script>\s*','',s,flags=re.I)
def strip_local_config(s):
    blocks=re.compile(r'<script(?:\s[^>]*)?>([\s\S]*?)</script>\s*',re.I)
    def repl(m):
        return "" if "KhaemenesClassToolsConfigV1" in m.group(1) else m.group(0)
    return blocks.sub(repl,s)

files=[]
for p in ROOT.rglob("*.html"):
    rel=p.relative_to(ROOT).as_posix()
    if rel.startswith("tests/"): continue
    files.append(p)

changed=[]
for p in files:
    s=p.read_text(encoding="utf-8")
    n=strip_local_config(s)
    for needle in ("bazaar-page-tools.js","khaemenes-translator-loader.js","vnv-language.js","vnv-class-tools-toolbar.js"):
        n=strip_named(n,needle)
    block="\n".join([tag(ROUTER),tag(TRANSLATOR),tag(LANGUAGE),tag(CLASS_TOOLS)])+"\n"
    eco=re.search(r'<script\b[^>]*src=["\'][^"\']*vnv-ecosystem-toolbar\.js[^"\']*["\'][^>]*>\s*</script>',n,re.I)
    if eco:
        n=n[:eco.start()]+block+n[eco.start():]
    else:
        n=n.replace("</body>",block+"</body>") if "</body>" in n else n+block
    if n!=s:
        p.write_text(n,encoding="utf-8")
        changed.append(p.relative_to(ROOT).as_posix())

rows=[]
for p in files:
    s=p.read_text(encoding="utf-8")
    rel=p.relative_to(ROOT).as_posix()
    def count(x): return len(re.findall(re.escape(x),s,re.I))
    rows.append({
      "path":rel,
      "router":count("bazaar-page-tools.js"),
      "translator":count("khaemenes-translator-loader.js"),
      "language":count("vnv-language.js"),
      "class_tools":count("vnv-class-tools-toolbar.js"),
      "ecosystem":count("vnv-ecosystem-toolbar.js"),
      "local_config_blocks":len(re.findall(r"KhaemenesClassToolsConfigV1",s))
    })
report={
 "schema":"bazaar-art-toolbar-sync-v1",
 "html_files":len(files),
 "files_changed":len(changed),
 "fully_synced":sum(1 for r in rows if r["router"]==r["translator"]==r["language"]==r["class_tools"]==1),
 "missing_or_duplicate":[r for r in rows if not(r["router"]==r["translator"]==r["language"]==r["class_tools"]==1)],
 "rows":rows
}
REPORT.write_text(json.dumps(report,indent=2)+"\n",encoding="utf-8")
print(json.dumps({k:v for k,v in report.items() if k not in ("rows","missing_or_duplicate")},indent=2))
