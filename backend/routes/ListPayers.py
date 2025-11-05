from fastapi import APIRouter
router = APIRouter(prefix="", tags=["ListPayers"])

@router.get("/api/payers")
async def list_payers():
    return [{"id": "acme", "name": "Acme Health"}]
