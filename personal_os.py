"""Personal OS control plane for Semicolon."""
import json, os, sqlite3, threading, time, uuid
ROOT=os.path.dirname(os.path.abspath(__file__))
DB=os.environ.get("PERSONAL_OS_DB",os.path.join(ROOT,"data","personal_os.db"))
TOKEN=os.environ.get("SEMICOLON_ADMIN_TOKEN","").strip(); LOCK=threading.Lock()
PERMISSIONS=["READ_PUBLIC","READ_PROJECT","WRITE_PROJECT","EXECUTE_LOCAL","NETWORK_ACCESS","DEVICE_CONTROL","SECRET_REFERENCE","ADMIN"]
AGENTS=[
 {"id":"personal-assistant","name":"AnshuX","description":"Main personal assistant and orchestrator.","model":"orchestrator","permissions":["READ_PUBLIC","READ_PROJECT","WRITE_PROJECT"]},
 {"id":"ada","name":"Ada","description":"Semicolon coding tutor and project assistant.","model":os.environ.get("AI_MODEL","configured-by-server"),"permissions":["READ_PUBLIC","READ_PROJECT","WRITE_PROJECT"]},
 {"id":"beast","name":"Beast","description":"Existing Beast agent; integration endpoint can be configured separately.","model":os.environ.get("BEAST_MODEL","external"),"permissions":["READ_PUBLIC","READ_PROJECT"]},
 {"id":"research","name":"Research Agent","description":"Research specialist.","model":"provider-configured","permissions":["READ_PUBLIC","NETWORK_ACCESS"]},
 {"id":"security","name":"Security Agent","description":"Security review specialist.","model":"provider-configured","permissions":["READ_PUBLIC","READ_PROJECT"]}]
def now(): return time.strftime("%Y-%m-%dT%H:%M:%SZ",time.gmtime())
def ident(p): return p+"-"+uuid.uuid4().hex[:10]
def auth(headers): return bool(TOKEN) and headers.get("Authorization","")=="Bearer "+TOKEN
def conn():
 os.makedirs(os.path.dirname(DB),exist_ok=True); c=sqlite3.connect(DB); c.row_factory=sqlite3.Row
 c.executescript("""CREATE TABLE IF NOT EXISTS agents(id TEXT PRIMARY KEY,name TEXT,description TEXT,model TEXT,permissions TEXT,status TEXT,created_at TEXT);CREATE TABLE IF NOT EXISTS memories(id TEXT PRIMARY KEY,kind TEXT,title TEXT,content TEXT,project TEXT,source TEXT,agent_id TEXT,confidence REAL,importance INTEGER,pinned INTEGER,created_at TEXT,updated_at TEXT);CREATE TABLE IF NOT EXISTS relations(id TEXT PRIMARY KEY,source_id TEXT,target_id TEXT,relation TEXT,created_at TEXT,UNIQUE(source_id,target_id,relation));CREATE TABLE IF NOT EXISTS tasks(id TEXT PRIMARY KEY,title TEXT,description TEXT,status TEXT,priority INTEGER,agent_id TEXT,requires_approval INTEGER,created_at TEXT,updated_at TEXT);CREATE TABLE IF NOT EXISTS events(id TEXT PRIMARY KEY,task_id TEXT,agent_id TEXT,action TEXT,status TEXT,permission TEXT,detail TEXT,created_at TEXT);""")
 for a in AGENTS:c.execute("INSERT INTO agents VALUES(?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,description=excluded.description,model=excluded.model,permissions=excluded.permissions",(a["id"],a["name"],a["description"],a["model"],json.dumps(a["permissions"]),"ready",now()))
 c.commit();return c
def overview():
 with LOCK:
  c=conn();
  try:return {"counts":{t:c.execute("SELECT COUNT(*) FROM "+t).fetchone()[0] for t in ("agents","memories","relations","tasks","events")},"agents":[dict(r) for r in c.execute("SELECT * FROM agents ORDER BY name")],"tasks":[dict(r) for r in c.execute("SELECT * FROM tasks ORDER BY updated_at DESC LIMIT 20")],"permissions":PERMISSIONS}
  finally:c.close()
def graph():
 with LOCK:
  c=conn();
  try:return {"nodes":[dict(r) for r in c.execute("SELECT * FROM memories ORDER BY updated_at DESC LIMIT 500")],"edges":[dict(r) for r in c.execute("SELECT * FROM relations ORDER BY created_at DESC LIMIT 1000")]}
  finally:c.close()
def memory(p,agent="personal-assistant"):
 title=str(p.get("title","")).strip()[:160];content=str(p.get("content","")).strip()[:12000]
 if not title or not content:raise ValueError("title and content are required")
 mid=ident("mem");t=now()
 with LOCK:
  c=conn();
  try:c.execute("INSERT INTO memories VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",(mid,str(p.get("kind","concept"))[:40],title,content,str(p.get("project",""))[:120] or None,str(p.get("source","user"))[:160],agent,float(p.get("confidence",1)),max(1,min(5,int(p.get("importance",3)))),1 if p.get("pinned") else 0,t,t));c.commit();return {"id":mid}
  finally:c.close()
def relation(p):
 with LOCK:
  c=conn();
  try:c.execute("INSERT OR IGNORE INTO relations VALUES(?,?,?,?,?)",(ident("rel"),str(p.get("source_id")),str(p.get("target_id")),str(p.get("relation","related_to"))[:50],now()));c.commit();return {"ok":True}
  finally:c.close()
def task(p):
 title=str(p.get("title","")).strip()[:180]
 if not title:raise ValueError("title is required")
 tid=ident("task");t=now();approval=1 if p.get("requires_approval") else 0
 with LOCK:
  c=conn();
  try:c.execute("INSERT INTO tasks VALUES(?,?,?,?,?,?,?,?,?)",(tid,title,str(p.get("description",""))[:5000],"waiting_approval" if approval else "queued",max(1,min(5,int(p.get("priority",3)))),str(p.get("agent_id","personal-assistant")),approval,t,t));c.execute("INSERT INTO events VALUES(?,?,?,?,?,?,?,?)",(ident("evt"),tid,"personal-assistant","task_created","ok","READ_PROJECT",title,t));c.commit();return dict(c.execute("SELECT * FROM tasks WHERE id=?",(tid,)).fetchone())
  finally:c.close()
def event(p):
 with LOCK:
  c=conn();
  try:c.execute("INSERT INTO events VALUES(?,?,?,?,?,?,?,?)",(ident("evt"),p.get("task_id"),p.get("agent_id","personal-assistant"),str(p.get("action","unknown"))[:100],p.get("status","ok"),p.get("permission","READ_PUBLIC"),str(p.get("detail",""))[:2000],now()));c.commit();return {"ok":True}
  finally:c.close()
