# Keep Ada's visitor identity neutral unless the server explicitly provides one.
# Python loads sitecustomize before ada_server.py, so this applies to the API process.
import os

if not os.environ.get("ADA_VISITOR_NAME"):
    os.environ["ADA_VISITOR_NAME"] = ""
