# backend/main.py
from fastapi import FastAPI, Request
from importlib import import_module
from pathlib import Path

app = FastAPI()

# Function-based middleware must be registered with a decorator
@app.middleware("http")
async def security_hook(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Policy-Mitigation"] = "placeholder"
    return response

# Auto-include all routers in backend/routes
routes_dir = Path(__file__).parent / "routes"
for p in routes_dir.glob("*.py"):
    if p.name == "__init__.py":
        continue
    mod = import_module(f"backend.routes.{p.stem}")
    if hasattr(mod, "router"):
        app.include_router(mod.router)

@app.get("/healthz")
async def healthz():
    return {"ok": True}
