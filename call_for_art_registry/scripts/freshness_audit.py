#!/usr/bin/env python3
import json, sys, urllib.request, urllib.error
from datetime import date, datetime, timedelta
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
DATA=ROOT/"data"
OPP=DATA/"opportunities.json"
POL=DATA/"freshness-policy.json"
REPORT=DATA/"freshness-report.json"
QUEUE=ROOT/"admin"/"freshness-queue.md"

def load(p):
    return json.loads(p.read_text(encoding="utf-8"))

def parse_day(v):
    if not v: return None
    try: return date.fromisoformat(str(v)[:10])
    except ValueError: return None

def check_url(url, timeout, agent):
    if not url:
        return {"state":"missing","status":None,"final_url":None,"error":"No official URL recorded."}
    headers={"User-Agent":agent,"Accept":"text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8"}
    for method in ("HEAD","GET"):
        try:
            req=urllib.request.Request(url,headers=headers,method=method)
            with urllib.request.urlopen(req,timeout=timeout) as r:
                code=getattr(r,"status",None) or r.getcode()
                if 200 <= code < 400:
                    return {"state":"reachable","status":code,"final_url":r.geturl(),"error":None}
                return {"state":"http-error","status":code,"final_url":r.geturl(),"error":f"HTTP {code}"}
        except urllib.error.HTTPError as e:
            if method=="HEAD" and e.code in (403,405):
                continue
            return {"state":"http-error","status":e.code,"final_url":url,"error":f"HTTP {e.code}"}
        except Exception as e:
            if method=="HEAD":
                continue
            return {"state":"unreachable","status":None,"final_url":url,"error":str(e)[:180]}
    return {"state":"unreachable","status":None,"final_url":url,"error":"Request failed."}

def main():
    today=date.today()
    data=load(OPP); policy=load(POL)
    max_age=int(policy["verification_max_age_days"])
    approaching=int(policy["approaching_deadline_days"])
    urgent=int(policy["urgent_deadline_days"])
    timeout=int(policy["http_timeout_seconds"])
    agent=policy["link_check_user_agent"]
    items=[]; changed=False
    counts={"total":0,"review_queue":0,"stale":0,"approaching":0,"urgent":0,"expired":0,"link_issues":0,"downgraded":0}

    for rec in data.get("records",[]):
        counts["total"]+=1
        v=rec.setdefault("verification",{})
        before=v.get("status","needs-recheck")
        reasons=[]; priority="normal"
        deadline=parse_day(rec.get("deadline"))
        checked=parse_day(v.get("checked_at"))
        recheck=parse_day(v.get("recheck_at"))
        rolling=bool(rec.get("rolling"))

        if deadline and not rolling:
            days=(deadline-today).days
            if days < 0:
                counts["expired"]+=1
                reasons.append(f"Deadline passed {abs(days)} day(s) ago.")
                if before!="flagged" and before!="expired":
                    v["status"]="expired"; changed=True
                priority="expired"
            elif days <= urgent:
                counts["urgent"]+=1; reasons.append(f"Deadline in {days} day(s)."); priority="urgent"
            elif days <= approaching:
                counts["approaching"]+=1; reasons.append(f"Deadline in {days} day(s)."); priority="soon"

        stale=False
        if recheck and recheck <= today:
            stale=True; reasons.append(f"Scheduled recheck date reached ({recheck.isoformat()}).")
        elif checked and (today-checked).days > max_age:
            stale=True; reasons.append(f"Verification is {(today-checked).days} days old; policy maximum is {max_age}.")
        elif before=="verified-current" and not checked:
            stale=True; reasons.append("Verified Current record has no checked_at date.")

        if stale:
            counts["stale"]+=1
            if v.get("status")=="verified-current":
                v["status"]="needs-recheck"; changed=True; counts["downgraded"]+=1
                reasons.append("Automatically downgraded to Needs Recheck; human re-verification required.")
            if priority=="normal": priority="recheck"

        link=check_url(rec.get("official_url"),timeout,agent)
        if link["state"]!="reachable":
            counts["link_issues"]+=1
            reasons.append("Official URL "+("is missing." if link["state"]=="missing" else f"check failed: {link['error']}."))
            if v.get("status")=="verified-current":
                v["status"]="needs-recheck"; changed=True; counts["downgraded"]+=1
                reasons.append("Automatically downgraded to Needs Recheck because official URL could not be confirmed.")
            if priority=="normal": priority="recheck"

        current=v.get("status","needs-recheck")
        if current in ("needs-recheck","flagged") and not reasons:
            reasons.append("Record already requires human review.")
        if reasons:
            counts["review_queue"]+=1
            items.append({
                "id":rec.get("id"),"title":rec.get("title"),"organizer":rec.get("organizer"),
                "status":current,"priority":priority,"deadline":rec.get("deadline"),"rolling":rolling,
                "checked_at":v.get("checked_at"),"recheck_at":v.get("recheck_at"),
                "official_url":rec.get("official_url"),"link_check":link,"reasons":reasons
            })

    data["updated"]=today.isoformat()
    data["freshness_audit"]={"last_run":datetime.utcnow().replace(microsecond=0).isoformat()+"Z","policy":"freshness-policy.json"}
    if changed:
        OPP.write_text(json.dumps(data,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")

    order={"urgent":0,"recheck":1,"soon":2,"expired":3,"normal":4}
    items.sort(key=lambda x:(order.get(x["priority"],9),x.get("deadline") or "9999-12-31",x.get("title") or ""))
    report={
      "schema":"bazaar-art-registry-freshness-report-v1","version":"1.0.0",
      "generated_at":datetime.utcnow().replace(microsecond=0).isoformat()+"Z",
      "run_date":today.isoformat(),"policy":policy,"counts":counts,"items":items
    }
    REPORT.write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")

    md=["# Call for Art Freshness Queue","",f"Generated: {report['generated_at']}","",
        f"- Records: **{counts['total']}**",f"- Human review queue: **{counts['review_queue']}**",
        f"- Urgent deadlines: **{counts['urgent']}**",f"- Approaching deadlines: **{counts['approaching']}**",
        f"- Stale verification: **{counts['stale']}**",f"- Link issues: **{counts['link_issues']}**",
        f"- Automatically downgraded: **{counts['downgraded']}**","",
        "> Automation may downgrade stale/unreachable Verified Current records or mark past non-rolling deadlines Expired. It never grants Verified Current and never automatically creates a Flagged status.",""]
    for item in items:
        md += [f"## {item['title']}",f"**{item.get('organizer') or 'Organizer not recorded'}** · {item['status']} · priority: {item['priority']}",""]
        md += [f"- {r}" for r in item["reasons"]]
        if item.get("official_url"): md.append(f"- Official URL: {item['official_url']}")
        md.append("")
    QUEUE.write_text("\n".join(md)+"\n",encoding="utf-8")
    print(json.dumps(counts,indent=2))
    return 0

if __name__=="__main__":
    raise SystemExit(main())
