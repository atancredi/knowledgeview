import re
import yaml
from pathlib import Path
from typing import List
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from os import environ as env

from dotenv import load_dotenv
load_dotenv()


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

VAULT_DIR = Path(env.get("VAULT_DIR", "./vault"))
DIST_DIR = Path("./frontend/dist")

class Note(BaseModel):
    id: str
    title: str
    path: str
    content: str
    tags: List[str]

@app.get("/api/notes", response_model=List[Note])
def get_notes():
    notes = []
    
    if not VAULT_DIR.exists() or not VAULT_DIR.is_dir():
        return notes

    for filepath in VAULT_DIR.rglob("*.md"):
        if any(part.startswith(".") for part in filepath.parts):
            continue
            
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                raw_text = f.read()
                
            content = raw_text
            tags = []
            
            fm_match = re.match(r"^---\n(.*?)\n---\n(.*)", raw_text, re.DOTALL)
            if fm_match:
                try:
                    metadata = yaml.safe_load(fm_match.group(1)) or {}
                    content = fm_match.group(2)
                    
                    if "tags" in metadata:
                        raw_tags = metadata["tags"]
                        if isinstance(raw_tags, list):
                            tags = [str(t).strip() for t in raw_tags]
                        elif isinstance(raw_tags, str):
                            tags = [t.strip() for t in raw_tags.split(",")]
                except yaml.YAMLError:
                    pass

            rel_path = filepath.relative_to(VAULT_DIR)
            path_parts = list(rel_path.parts)
            
            if path_parts:
                path_parts.pop()
                
            clean_path = "/".join(path_parts)

            notes.append(
                Note(
                    id=rel_path.as_posix(),
                    title=filepath.stem,
                    path=clean_path,
                    content=content.strip(),
                    tags=tags,
                )
            )
        except Exception:
            continue
            
    return notes

if DIST_DIR.exists() and DIST_DIR.is_dir():
    app.mount("/app", StaticFiles(directory=DIST_DIR, html=True), name="app")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)