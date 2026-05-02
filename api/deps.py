"""
FastAPI dependencies for identity resolution.

This module owns one concern: turning a raw HTTP request into a known User.
Routes own a separate concern: deciding whether that User is allowed to touch
a specific resource. Keep those two things apart — deps.py never returns 403,
routes never decode tokens.
"""

import asyncio
from typing import Any, cast

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import PyJWKClient
from jwt import decode as jwt_decode
from jwt.exceptions import ExpiredSignatureError, PyJWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from db import get_db
from models.user import User

# HTTPBearer reads the Authorization header and requires the "Bearer " scheme.
# auto_error=False lets us return a cleaner 401 ourselves rather than FastAPI's
# default 403 when the header is missing entirely.
_bearer = HTTPBearer(auto_error=False)

# Module-level JWKS client — created lazily on first request, shared for the
# lifetime of the process. PyJWKClient caches keys and auto-refetches when an
# unknown kid is encountered, handling Clerk key rotations transparently.
_jwks_client: PyJWKClient | None = None


def _get_jwks_client() -> PyJWKClient:
    global _jwks_client
    if _jwks_client is None:
        _jwks_client = PyJWKClient(settings.clerk_jwks_url, cache_jwk_set=True, lifespan=300)
    return _jwks_client


async def _verify_clerk_jwt(token: str) -> str:
    """Verify a Clerk-issued JWT and return the clerk_id (sub claim).

    Runs the synchronous PyJWKClient JWKS fetch in a thread pool to avoid
    blocking the event loop.

    Raises:
        ExpiredSignatureError: token is past its exp claim.
        PyJWTError: signature invalid, issuer mismatch, malformed token, etc.
    """
    client = _get_jwks_client()

    def _sync() -> str:
        signing_key = client.get_signing_key_from_jwt(token)
        payload: dict[str, Any] = jwt_decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            issuer=settings.clerk_issuer,
        )
        sub = payload.get("sub")
        if not isinstance(sub, str):
            raise PyJWTError("sub claim missing or not a string")
        return sub

    return await asyncio.to_thread(_sync)


async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Resolve the bearer token to a User row.

    Raises:
        401 if no Authorization header is present.
        401 if the token is expired or has an invalid signature/issuer.
        404 if the clerk_id from the token is not in the database yet.
    """
    if request.method == "OPTIONS":
        return cast(User, None)

    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        clerk_id = await _verify_clerk_jwt(credentials.credentials)
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired",
            headers={"WWW-Authenticate": "Bearer"},
        ) from None
    except PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        ) from None

    result = await db.execute(select(User).where(User.clerk_id == clerk_id))
    user = result.scalar_one_or_none()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return user
