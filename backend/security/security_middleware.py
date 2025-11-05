# security_middleware.py
from fastapi import Request, Response

async def security_hook(request: Request, call_next):
    # tiny placeholder; safe to keep
    response: Response = await call_next(request)
    response.headers["X-Policy-Mitigation"] = "placeholder"
    return response
