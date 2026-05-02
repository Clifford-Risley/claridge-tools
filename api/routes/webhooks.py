import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from svix.webhooks import Webhook, WebhookVerificationError

from config import settings
from db import get_db
from models.user import User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


@router.post("/clerk", status_code=status.HTTP_200_OK)
async def clerk_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    svix_id = request.headers.get("svix-id")
    svix_timestamp = request.headers.get("svix-timestamp")
    svix_signature = request.headers.get("svix-signature")

    if not (svix_id and svix_timestamp and svix_signature):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing svix headers",
        )

    body = await request.body()

    try:
        wh = Webhook(settings.clerk_webhook_secret)
        payload: dict[str, Any] = wh.verify(
            body,
            {
                "svix-id": svix_id,
                "svix-timestamp": svix_timestamp,
                "svix-signature": svix_signature,
            },
        )
    except WebhookVerificationError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid webhook signature",
        ) from None

    if payload.get("type") != "user.created":
        return {"status": "ok"}

    data: dict[str, Any] = payload["data"]
    clerk_id: str = data["id"]

    result = await db.execute(select(User).where(User.clerk_id == clerk_id))
    if result.scalar_one_or_none() is not None:
        return {"status": "ok"}

    primary_email_id: str = data["primary_email_address_id"]
    email_addresses: list[dict[str, Any]] = data["email_addresses"]
    email: str | None = next(
        (ea["email_address"] for ea in email_addresses if ea["id"] == primary_email_id),
        None,
    )
    if email is None:
        logger.warning("No primary email found for clerk_id=%s; skipping", clerk_id)
        return {"status": "ok"}

    first_name: str | None = data.get("first_name") or None
    last_name: str | None = data.get("last_name") or None
    name_parts = [p for p in [first_name, last_name] if p]
    display_name = " ".join(name_parts) if name_parts else email.split("@")[0]

    user = User(clerk_id=clerk_id, email=email, display_name=display_name)
    db.add(user)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        logger.warning(
            "Duplicate constraint on user insert: clerk_id=%s email=%s",
            clerk_id,
            email,
        )

    return {"status": "ok"}
