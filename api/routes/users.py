from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from db import get_db
from deps import get_current_user
from models.tool import Tool
from models.user import User
from schemas.tool import ToolRead
from schemas.user import UserRead

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserRead)
async def get_me(current_user: User = Depends(get_current_user)) -> User:
    return current_user


@router.get("/me/tools", response_model=list[ToolRead])
async def get_my_tools(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Tool]:
    result = await db.execute(select(Tool).where(Tool.owner_id == current_user.id))
    return list(result.scalars().all())
