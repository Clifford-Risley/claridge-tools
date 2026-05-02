import base64
import hashlib
import hmac
import json
import time
from collections.abc import AsyncGenerator
from typing import cast
from unittest.mock import AsyncMock, MagicMock

import pytest
from httpx import ASGITransport, AsyncClient, Response
from sqlalchemy.ext.asyncio import AsyncSession

from db import get_db
from main import app
from models.user import User

# Matches whsec_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA= (set in conftest.py)
_TEST_SECRET_BYTES = b"\x00" * 32


def _signed_headers(body: str, msg_id: str = "msg_test_001") -> dict[str, str]:
    """Compute valid svix signature headers using the test secret."""
    ts = str(int(time.time()))
    to_sign = f"{msg_id}.{ts}.{body}"
    sig = hmac.new(_TEST_SECRET_BYTES, to_sign.encode(), hashlib.sha256).digest()
    return {
        "svix-id": msg_id,
        "svix-timestamp": ts,
        "svix-signature": f"v1,{base64.b64encode(sig).decode()}",
    }


def _user_created_payload(
    clerk_id: str = "user_test123",
    email: str = "alice@claridge.local",
    first_name: str = "Alice",
    last_name: str = "Smith",
) -> str:
    return json.dumps({
        "type": "user.created",
        "data": {
            "id": clerk_id,
            "primary_email_address_id": "iead_primary",
            "email_addresses": [{"id": "iead_primary", "email_address": email}],
            "first_name": first_name,
            "last_name": last_name,
        },
    })


def _mock_db(existing_user: User | None = None) -> AsyncMock:
    result = MagicMock()
    result.scalar_one_or_none.return_value = existing_user
    mock: AsyncMock = AsyncMock(spec=AsyncSession)
    mock.execute.return_value = result
    return mock


async def _post(
    body: bytes,
    headers: dict[str, str],
    existing_user: User | None = None,
) -> tuple[Response, AsyncMock]:
    """Send a POST to /webhooks/clerk with a mocked DB session."""
    mock_session = _mock_db(existing_user)

    async def override_get_db() -> AsyncGenerator[AsyncSession]:
        yield cast(AsyncSession, mock_session)

    app.dependency_overrides[get_db] = override_get_db
    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post("/webhooks/clerk", content=body, headers=headers)
    finally:
        app.dependency_overrides.pop(get_db, None)

    return response, mock_session


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------


async def test_missing_svix_headers() -> None:
    response, _ = await _post(b"{}", {})
    assert response.status_code == 400


async def test_invalid_signature() -> None:
    response, _ = await _post(
        b"{}",
        {
            "svix-id": "msg_bad",
            "svix-timestamp": str(int(time.time())),
            # Correct format, wrong value — verification must fail
            "svix-signature": "v1,AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
        },
    )
    assert response.status_code == 400


async def test_valid_user_created() -> None:
    body_str = _user_created_payload()
    response, mock_session = await _post(body_str.encode(), _signed_headers(body_str))

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    mock_session.add.assert_called_once()
    mock_session.commit.assert_called_once()


async def test_duplicate_delivery() -> None:
    existing = User(clerk_id="user_dup", email="dup@claridge.local", display_name="Dup User")
    body_str = _user_created_payload(clerk_id="user_dup", email="dup@claridge.local")
    response, mock_session = await _post(
        body_str.encode(), _signed_headers(body_str), existing_user=existing
    )

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    mock_session.add.assert_not_called()


async def test_unknown_event_type() -> None:
    body_str = json.dumps({"type": "user.updated", "data": {}})
    response, mock_session = await _post(body_str.encode(), _signed_headers(body_str))

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    mock_session.execute.assert_not_called()
    mock_session.add.assert_not_called()


@pytest.mark.parametrize(
    "first_name,last_name,email,expected_display",
    [
        ("Alice", "Smith", "alice@claridge.local", "Alice Smith"),
        ("Alice", None, "alice@claridge.local", "Alice"),
        (None, "Smith", "alice@claridge.local", "Smith"),
        (None, None, "alice@claridge.local", "alice"),
    ],
)
async def test_display_name_construction(
    first_name: str | None,
    last_name: str | None,
    email: str,
    expected_display: str,
) -> None:
    body_str = json.dumps({
        "type": "user.created",
        "data": {
            "id": "user_name_test",
            "primary_email_address_id": "iead_1",
            "email_addresses": [{"id": "iead_1", "email_address": email}],
            "first_name": first_name,
            "last_name": last_name,
        },
    })
    response, mock_session = await _post(body_str.encode(), _signed_headers(body_str))

    assert response.status_code == 200
    added_user: User = mock_session.add.call_args[0][0]
    assert added_user.display_name == expected_display
