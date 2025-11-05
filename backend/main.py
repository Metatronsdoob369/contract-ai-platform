# backend/security/security_middleware.py
from fastapi import Request, Response

# Example callable you can import if you later switch to class-based middleware
async def security_hook(request: Request, call_next):
    response: Response = await call_next(request)
    response.headers["X-Policy-Mitigation"] = "placeholder"
    return response
