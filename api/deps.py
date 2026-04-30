"""
FastAPI dependencies for identity resolution.

This module owns one concern: turning a raw HTTP request into a known User.
Routes own a separate concern: deciding whether that User is allowed to touch
a specific resource. Keep those two things apart — deps.py never returns 403,
routes never decode tokens.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from db import get_db
from models.user import User

# HTTPBearer reads the Authorization header and requires the "Bearer " scheme.
# auto_error=False lets us return a cleaner 401 ourselves rather than FastAPI's
# default 403 when the header is missing entirely.
_bearer = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Resolve the bearer token to a User row.

    Sprint 6 will replace the stub block with real Clerk JWT verification.
    The function signature, return type, and raised exceptions will not change,
    so every route that depends on this can be written now and will work
    unchanged after the real implementation lands.

    Raises:
        401 if no Authorization header is present.
        401 if the token does not map to a known user (stub: any token works,
            real: invalid/expired JWTs will be rejected here).
        404 if the clerk_id from the token is not in the database yet.
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # SPRINT 6: replace this line with Clerk JWT verification
    # clerk_id = await verify_clerk_jwt(credentials.credentials)
    clerk_id = credentials.credentials  # stub: raw token treated as clerk_id
    # ------------------------------------------------------------------ #

    result = await db.execute(select(User).where(User.clerk_id == clerk_id))
    user = result.scalar_one_or_none()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return user
