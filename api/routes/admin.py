import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from db import get_db
from deps import get_current_user
from models.tool import Tool
from models.user import User
from schemas.tool import ToolRead, ToolReadWithOwner
from schemas.user import UserRead

router = APIRouter(prefix="/admin", tags=["admin"])

_CLERK_API_BASE = "https://api.clerk.com/v1"


class _InviteRequest(BaseModel):
    email: str


def _require_admin(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.clerk_id or current_user.clerk_id != settings.admin_clerk_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")
    return current_user


@router.get("/tools", response_model=list[ToolReadWithOwner])
async def admin_list_tools(
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(_require_admin),
) -> list[ToolReadWithOwner]:
    stmt = select(Tool, User.display_name).join(User, Tool.owner_id == User.id)
    rows = (await db.execute(stmt)).all()
    return [
        ToolReadWithOwner(
            id=tool.id,
            owner_id=tool.owner_id,
            name=tool.name,
            description=tool.description,
            category_tag=tool.category_tag,
            notes=tool.notes,
            created_at=tool.created_at,
            updated_at=tool.updated_at,
            owner_name=owner_name,
        )
        for tool, owner_name in rows
    ]


@router.get("/users", response_model=list[UserRead])
async def admin_list_users(
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(_require_admin),
) -> list[User]:
    result = await db.execute(select(User))
    return list(result.scalars().all())


@router.post("/invite")
async def invite_user(
    body: _InviteRequest,
    _admin: User = Depends(_require_admin),
) -> dict[str, str | bool]:
    async with httpx.AsyncClient() as clerk:
        resp = await clerk.post(
            f"{_CLERK_API_BASE}/invitations",
            headers={"Authorization": f"Bearer {settings.clerk_secret_key}"},
            json={"email_address": body.email},
        )
    if not resp.is_success:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Clerk error: {resp.text}",
        )
    return {"invited": True, "email": body.email}


@router.delete("/users/{clerk_id}")
async def delete_user(
    clerk_id: str,
    _admin: User = Depends(_require_admin),
) -> dict[str, str | bool]:
    async with httpx.AsyncClient() as clerk:
        resp = await clerk.delete(
            f"{_CLERK_API_BASE}/users/{clerk_id}",
            headers={"Authorization": f"Bearer {settings.clerk_secret_key}"},
        )
    if not resp.is_success:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Clerk error: {resp.text}",
        )
    return {"deleted": True, "clerk_id": clerk_id}
