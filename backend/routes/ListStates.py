from fastapi import APIRouter
router = APIRouter(prefix="", tags=["ListStates"])

@router.get("/api/states")
async def list_states():
    return [{"code": "AL", "name": "Alabama"}, {"code": "GA", "name": "Georgia"}]
