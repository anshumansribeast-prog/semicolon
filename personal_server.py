"""Combined Semicolon + Ada + Personal OS server."""
import json
from http.server import ThreadingHTTPServer
from urllib.parse import urlparse
import ada_server
import personal_os

class PersonalHandler(ada_server.AdaHandler):
 def do_GET(self):
  path=urlparse(self.path).path
  if path=="/api/personal/overview": return self._personal(200,personal_os.overview())
  if path=="/api/personal/graph": return self._personal(200,personal_os.graph())
  if path=="/api/personal/health": return self._personal(200,{"ok":True,"service":"personal-os"})
  return super().do_GET()
 def do_POST(self):
  path=urlparse(self.path).path
  if path.startswith("/api/personal/"):
   if not personal_os.auth(self.headers): return self._personal(401,{"error":"admin authorization required"})
   try:
    n=int(self.headers.get("Content-Length",0))
    if n>200000:return self._personal(413,{"error":"payload too large"})
    body=json.loads(self.rfile.read(n) or b"{}")
    if path=="/api/personal/memory":out=personal_os.memory(body)
    elif path=="/api/personal/relation":out=personal_os.relation(body)
    elif path=="/api/personal/task":out=personal_os.task(body)
    elif path=="/api/personal/event":out=personal_os.event(body)
    else:return self._personal(404,{"error":"unknown personal-os endpoint"})
    return self._personal(200,out)
   except (ValueError,TypeError) as e:return self._personal(400,{"error":str(e)})
   except Exception as e:return self._personal(500,{"error":"internal personal-os error"})
  return super().do_POST()
 def _personal(self,status,payload):self._reply(status,payload)

if __name__=="__main__":
 server=ThreadingHTTPServer((ada_server.HOST,ada_server.PORT),PersonalHandler)
 print("Personal OS + Ada listening on http://%s:%s"%(ada_server.HOST,ada_server.PORT));server.serve_forever()
