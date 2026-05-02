from collections.abc import AsyncGenerator
from datetime import datetime
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from db import get_db
from deps import get_current_user
from main import app
from models.tool import Tool
from models.user import Role, User

# Matches what we inject into mock_settings.admin_clerk_user_id for admin tests.
_ADMIN_CLERK_ID = "admin_clerk_id"


@pytest.fixture
def admin_user() -> User:
    user = User(
        id=99,
        clerk_id=_ADMIN_CLERK_ID,
        email="admin@claridge.local",
        display_name="Admin",
        phone=None,
        address=None,
        role=Role.member,
    )
    user.created_at = datetime(2026, 1, 1)
    return user


def _clerk_mock(*, is_success: bool = True) -> MagicMock:
    """Async context manager mock for httpx.AsyncClient().

    Usage: patch("routes.admin.httpx.AsyncClient", return_value=_clerk_mock())
    Then: async with httpx.AsyncClient() as clerk  →  clerk is the AsyncMock
    whose .post() and .delete() return the configured mock response.
    """
    mock_response = MagicMock()
    mock_response.is_success = is_success
    mock_response.text = "" if is_success else "Unprocessable Entity"

    mock_http = AsyncMock()
    mock_http.post.return_value = mock_response
    mock_http.delete.return_value = mock_response

    mock_instance = MagicMock()
    mock_instance.__aenter__ = AsyncMock(return_value=mock_http)
    mock_instance.__aexit__ = AsyncMock(return_value=False)

    return mock_instance


# ---------------------------------------------------------------------------
# POST /admin/invite
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_invite_success(admin_user: User) -> None:
    app.dependency_overrides[get_current_user] = lambda: admin_user

    try:
        with (
            patch("routes.admin.settings") as mock_settings,
            patch("routes.admin.httpx.AsyncClient", return_value=_clerk_mock()),
        ):
            mock_settings.admin_clerk_user_id = _ADMIN_CLERK_ID
            mock_settings.clerk_secret_key = "test-secret"
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
                response = await c.post("/admin/invite", json={"email": "new@claridge.local"})
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json() == {"invited": True, "email": "new@claridge.local"}


@pytest.mark.asyncio
async def test_invite_non_admin_returns_403(test_user: User) -> None:
    # test_user.clerk_id == "test_clerk_id" != _ADMIN_CLERK_ID → 403 before any Clerk call.
    app.dependency_overrides[get_current_user] = lambda: test_user

    try:
        with patch("routes.admin.settings") as mock_settings:
            mock_settings.admin_clerk_user_id = _ADMIN_CLERK_ID
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
                response = await c.post("/admin/invite", json={"email": "new@claridge.local"})
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 403
    assert response.json()["detail"] == "Admin only"


@pytest.mark.asyncio
async def test_invite_clerk_failure_returns_502(admin_user: User) -> None:
    app.dependency_overrides[get_current_user] = lambda: admin_user

    try:
        with (
            patch("routes.admin.settings") as mock_settings,
            patch("routes.admin.httpx.AsyncClient", return_value=_clerk_mock(is_success=False)),
        ):
            mock_settings.admin_clerk_user_id = _ADMIN_CLERK_ID
            mock_settings.clerk_secret_key = "test-secret"
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
                response = await c.post("/admin/invite", json={"email": "new@claridge.local"})
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 502


# ---------------------------------------------------------------------------
# DELETE /admin/users/{clerk_id}
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_delete_user_success(admin_user: User) -> None:
    app.dependency_overrides[get_current_user] = lambda: admin_user

    try:
        with (
            patch("routes.admin.settings") as mock_settings,
            patch("routes.admin.httpx.AsyncClient", return_value=_clerk_mock()),
        ):
            mock_settings.admin_clerk_user_id = _ADMIN_CLERK_ID
            mock_settings.clerk_secret_key = "test-secret"
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
                response = await c.delete("/admin/users/user_abc123")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json() == {"deleted": True, "clerk_id": "user_abc123"}


@pytest.mark.asyncio
async def test_delete_user_non_admin_returns_403(test_user: User) -> None:
    app.dependency_overrides[get_current_user] = lambda: test_user

    try:
        with patch("routes.admin.settings") as mock_settings:
            mock_settings.admin_clerk_user_id = _ADMIN_CLERK_ID
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
                response = await c.delete("/admin/users/user_abc123")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 403
    assert response.json()["detail"] == "Admin only"


@pytest.mark.asyncio
async def test_delete_user_clerk_failure_returns_502(admin_user: User) -> None:
    app.dependency_overrides[get_current_user] = lambda: admin_user

    try:
        with (
            patch("routes.admin.settings") as mock_settings,
            patch("routes.admin.httpx.AsyncClient", return_value=_clerk_mock(is_success=False)),
        ):
            mock_settings.admin_clerk_user_id = _ADMIN_CLERK_ID
            mock_settings.clerk_secret_key = "test-secret"
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
                response = await c.delete("/admin/users/user_abc123")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 502


# ---------------------------------------------------------------------------
# GET /admin/tools
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_admin_list_tools_returns_enriched(admin_user: User, test_user: User) -> None:
    tool = Tool(id=1, owner_id=test_user.id, name="Drill")
    tool.description = "DeWalt 20V"
    tool.category_tag = "power-tools"
    tool.notes = None
    tool.created_at = datetime(2026, 1, 1)
    tool.updated_at = datetime(2026, 1, 1)

    async def mock_get_db() -> AsyncGenerator[AsyncSession, None]:
        result = MagicMock()
        result.all.return_value = [(tool, test_user.display_name)]
        mock_db = AsyncMock(spec=AsyncSession)
        mock_db.execute.return_value = result
        yield mock_db  # type: ignore[misc]

    app.dependency_overrides[get_current_user] = lambda: admin_user
    app.dependency_overrides[get_db] = mock_get_db

    try:
        with patch("routes.admin.settings") as mock_settings:
            mock_settings.admin_clerk_user_id = _ADMIN_CLERK_ID
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
                response = await c.get("/admin/tools")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Drill"
    assert data[0]["owner_name"] == test_user.display_name
    assert data[0]["owner_id"] == test_user.id


@pytest.mark.asyncio
async def test_admin_list_tools_non_admin_returns_403(test_user: User) -> None:
    app.dependency_overrides[get_current_user] = lambda: test_user

    try:
        with patch("routes.admin.settings") as mock_settings:
            mock_settings.admin_clerk_user_id = _ADMIN_CLERK_ID
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
                response = await c.get("/admin/tools")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 403
    assert response.json()["detail"] == "Admin only"


# ---------------------------------------------------------------------------
# GET /admin/users
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_admin_list_users_returns_all(admin_user: User, test_user: User) -> None:
    async def mock_get_db() -> AsyncGenerator[AsyncSession, None]:
        scalars = MagicMock()
        scalars.all.return_value = [test_user]
        result = MagicMock()
        result.scalars.return_value = scalars
        mock_db = AsyncMock(spec=AsyncSession)
        mock_db.execute.return_value = result
        yield mock_db  # type: ignore[misc]

    app.dependency_overrides[get_current_user] = lambda: admin_user
    app.dependency_overrides[get_db] = mock_get_db

    try:
        with patch("routes.admin.settings") as mock_settings:
            mock_settings.admin_clerk_user_id = _ADMIN_CLERK_ID
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
                response = await c.get("/admin/users")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["email"] == test_user.email
    assert data[0]["display_name"] == test_user.display_name


@pytest.mark.asyncio
async def test_admin_list_users_non_admin_returns_403(test_user: User) -> None:
    app.dependency_overrides[get_current_user] = lambda: test_user

    try:
        with patch("routes.admin.settings") as mock_settings:
            mock_settings.admin_clerk_user_id = _ADMIN_CLERK_ID
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
                response = await c.get("/admin/users")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 403
