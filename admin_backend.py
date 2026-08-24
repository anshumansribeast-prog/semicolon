"""Semicolon admin backend: GitHub issues + real agent orchestration.

Runs beside the existing Ada server. No secrets are stored in the repository.
Required environment variables:
  GITHUB_TOKEN       GitHub token with repo/issues/contents/pull-request access
  AI_API_KEY         OpenAI-compatible model key
  AI_API_URL         e.g. https://openrouter.ai/api/v1 or Groq endpoint
  AI_MODEL           model id
Optional:
  ADMIN_HOST=127.0.0.1
  ADMIN_PORT=8430
  ADMIN_WEBHOOK_SECRET=...
  ADMIN_REPO=anshumansribeast-prog/semicolon

The agents create a branch and a DRAFT PR containing an agent report. They do
not merge automatically. CI must pass and a human can review/merge the PR.
"""
import hashlib, hmac, json, os, re, threading, time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib import request as urlreq
from urllib.error import HTTPError

HOST = os.getenv("ADMIN_HOST", "127.0.0.1")
PORT = int(os.getenv("ADMIN_PORT", "8430"))
REPO = os.getenv("ADMIN_REPO", "anshumansribeast-prog/semicolon")
GH_TOKEN = os.getenv("GITHUB_TOKEN", "").strip()
AI_KEY = os.getenv("AI_API_KEY", "").strip()
AI_URL = (os.getenv("AI_API_URL", "https://openrouter.ai/api/v1").strip().rstrip("/"))
AI_MODEL = os.getenv("AI_MODEL", "qwen/qwen-2.5-7b-instruct").strip()
WEBHOOK_SECRET = os.getenv("ADMIN_WEBHOOK_SECRET", "").strip()
ADMIN_TOKEN = os.getenv("SEMICOLON_ADMIN_TOKEN", "").strip()

AGENTS = {
    "Ada": {"role": "Semicolon Debugger", "scope": "coding bugs, frontend/backend bugs, Ada integration"},
    "Beast": {"role": "Cosmos QA Agent", "scope": "QA, regression analysis, tests, astronomy content correctness"},
    "FixBot": {"role": "Patch Generator", "scope": "small, safe code patches and test suggestions"},
    "Sentinel": {"role": "Monitoring Agent", "scope": "health, logs, deployment and reliability"},
}

jobs = {}
lock = threading.Lock()


def gh(path, method="GET", body=None):
    if not GH_TOKEN:
        raise RuntimeError("GITHUB_TOKEN is not configured on the server")
    data = None if body is None else json.dumps(body).encode()
    req = urlreq.Request(
        "https://api.github.com" + path,
        data=data,
        method=method,
        headers={"Accept": "application/vnd.github+json", "Authorization": "Bearer " + GH_TOKEN,
                 "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "semicolon-admin-agent"},
    )
    try:
        with urlreq.urlopen(req, timeout=30) as r:
            return json.loads(r.read() or b"{}")
    except HTTPError as e:
        detail = e.read().decode(errors="replace")
        raise RuntimeError(f"GitHub {e.code}: {detail[:500]}")


def ai(prompt):
    if not AI_KEY:
        raise RuntimeError("AI_API_KEY is not configured on the server")
    url = AI_URL + ("/chat/completions" if not AI_URL.endswith("/chat/completions") else "")
    payload = json.dumps({"model": AI_MODEL, "temperature": 0.2,
                          "messages": [{"role": "system", "content":
                              "You are a careful software engineering agent. Never claim you changed code when you did not. Return concise, actionable analysis. Do not request or expose secrets."},
                              {"role": "user", "content": prompt}]}).encode()
    req = urlreq.Request(url, data=payload, method="POST", headers={"Content-Type":"application/json",
        "Authorization":"Bearer "+AI_KEY, "User-Agent":"semicolon-admin-agent"})
    with urlreq.urlopen(req, timeout=90) as r:
        data=json.loads(r.read())
    return ((data.get("choices") or [{}])[0].get("message") or {}).get("content", "").strip()


def gh_file(path, ref):
    data = gh(f"/repos/{REPO}/contents/{path}?ref={ref}")
    if data.get("type") != "file" or data.get("size", 0) > 200000:
        return None
    import base64
    return base64.b64decode(data.get("content", "")).decode("utf-8", errors="replace")


def create_report(issue, agent, analysis):
    base = gh(f"/repos/{REPO}")
    default_branch = base.get("default_branch", "main")
    branch = "agents/issue-{}-{}-{}".format(issue["number"], agent.lower(), int(time.time()))
    gh(f"/repos/{REPO}/git/refs", "POST", {"ref":"refs/heads/"+branch,
       "sha":gh(f"/repos/{REPO}/git/ref/heads/{default_branch}")["object"]["sha"]})
    report = f"# {agent} report — issue #{issue['number']}\n\n"
    report += f"**Issue:** {issue['title']}\n\n**Agent:** {AGENTS[agent]['role']}\n\n"
    report += "## Investigation\n\n" + analysis + "\n\n"
    report += "## Safety\n\nThis PR is a draft. No production merge was performed by the agent.\n"
    import base64
    encoded = base64.b64encode(report.encode()).decode()
    path = f"agent-reports/issue-{issue['number']}-{agent.lower()}.md"
    gh(f"/repos/{REPO}/contents/{path}", "PUT", {"message":f"agent: {agent} report for issue #{issue['number']}",
       "content":encoded, "branch":branch})
    pr = gh(f"/repos/{REPO}/pulls", "POST", {"title":f"[Agent:{agent}] Investigate #{issue['number']}: {issue['title']}",
       "head":branch, "base":default_branch, "body":f"Automated investigation for #{issue['number']}.\n\nAgent: {agent}\n\nThis is a draft PR containing the investigation report. Review before any merge.", "draft":True})
    return branch, pr.get("number"), pr.get("html_url")


def run_agent(issue_number, agent):
    key=f"{issue_number}:{agent}"
    with lock: jobs[key]={"status":"Investigating","issue":issue_number,"agent":agent}
    try:
        issue=gh(f"/repos/{REPO}/issues/{issue_number}")
        prompt=(f"Agent: {agent} ({AGENTS[agent]['scope']})\n"
                f"Repository: {REPO}\nIssue #{issue_number}: {issue.get('title')}\n\n"
                f"Description:\n{issue.get('body') or '(none)'}\n\n"
                "Give: 1) likely root cause, 2) evidence needed, 3) exact files likely involved, "
                "4) safe fix plan, 5) tests/verification steps. Do not invent repository facts.")
        analysis=ai(prompt)
        with lock: jobs[key]={"status":"Creating PR","issue":issue_number,"agent":agent,"analysis":analysis}
        branch, pr, url=create_report(issue,agent,analysis)
        # Label the issue so GitHub itself reflects the agent state.
        try: gh(f"/repos/{REPO}/issues/{issue_number}/labels", "POST", {"labels":[f"agent:{agent.lower()}","agent:pr-ready"]})
        except Exception: pass
        with lock: jobs[key]={"status":"PR Ready","issue":issue_number,"agent":agent,"analysis":analysis,"branch":branch,"pr":pr,"url":url}
    except Exception as e:
        with lock: jobs[key]={"status":"Failed","issue":issue_number,"agent":agent,"error":str(e)}


def authorized(headers):
    if not ADMIN_TOKEN:
        return True
    return headers.get("Authorization", "") == "Bearer " + ADMIN_TOKEN


def body(req):
    n=int(req.headers.get("Content-Length","0"))
    return json.loads(req.rfile.read(n) or b"{}")


class Handler(BaseHTTPRequestHandler):
    def reply(self, code, obj):
        raw=json.dumps(obj).encode()
        self.send_response(code); self.send_header("Content-Type","application/json"); self.send_header("Content-Length",str(len(raw))); self.end_headers(); self.wfile.write(raw)

    def do_GET(self):
        if self.path == "/api/admin/health":
            self.reply(200,{"ok":True,"github":bool(GH_TOKEN),"ai":bool(AI_KEY),"model":AI_MODEL,"repo":REPO,"agents":list(AGENTS)})
            return
        if self.path == "/api/admin/jobs":
            with lock: self.reply(200,{"jobs":list(jobs.values())});
            return
        self.reply(404,{"error":"not found"})

    def do_POST(self):
        if self.path == "/api/admin/assign":
            if not authorized(self.headers): self.reply(401,{"error":"unauthorized"}); return
            try:
                b=body(self); issue=int(b["issue"]); agent=b["agent"]
                if agent not in AGENTS: raise ValueError("unknown agent")
                key=f"{issue}:{agent}"
                with lock:
                    if jobs.get(key,{}).get("status") in ("Investigating","Creating PR"): self.reply(409,{"error":"already running"}); return
                gh(f"/repos/{REPO}/issues/{issue}/labels","POST",{"labels":[f"agent:{agent.lower()}","agent:investigating"]})
                threading.Thread(target=run_agent,args=(issue,agent),daemon=True).start()
                self.reply(202,{"ok":True,"status":"queued","issue":issue,"agent":agent})
            except Exception as e: self.reply(400,{"error":str(e)})
            return
        if self.path == "/api/admin/webhook":
            raw=self.rfile.read(int(self.headers.get("Content-Length","0")))
            if WEBHOOK_SECRET:
                expected="sha256="+hmac.new(WEBHOOK_SECRET.encode(),raw,hashlib.sha256).hexdigest()
                if not hmac.compare_digest(expected,self.headers.get("X-Hub-Signature-256","")):
                    self.reply(401,{"error":"bad signature"}); return
            try:
                event=json.loads(raw or b"{}")
                if self.headers.get("X-GitHub-Event")=="issues" and event.get("action") in ("opened","labeled","reopened"):
                    labels={x.get("name","") for x in event.get("issue",{}).get("labels",[])}
                    mapping={"agent:ada":"Ada","agent:beast":"Beast","agent:fixbot":"FixBot","agent:sentinel":"Sentinel"}
                    for label,agent in mapping.items():
                        if label in labels:
                            threading.Thread(target=run_agent,args=(event["issue"]["number"],agent),daemon=True).start()
                            break
                self.reply(202,{"ok":True})
            except Exception as e: self.reply(400,{"error":str(e)})
            return
        self.reply(404,{"error":"not found"})


if __name__ == "__main__":
    print(f"Semicolon Admin Backend listening on {HOST}:{PORT} for {REPO}")
    ThreadingHTTPServer((HOST,PORT),Handler).serve_forever()
