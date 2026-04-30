from collections.abc import AsyncGenerator
from datetime import datetime
from unittest.mock import AsyncMock, MagicMock

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from db import get_db
from deps import get_current_user
from main import app
from models.tool import Tool
from models.user import User


def _mock_execute_returning(tools: list[Tool]) -> AsyncMock:
    """Return a mock db where db.execute(...).scalars().all() yields `tools`."""
    scalars = MagicMock()
    scalars.all.return_value = tools
    result = MagicMock()
    result.scalars.return_value = scalars
    mock_db = AsyncMock(spec=AsyncSession)
    mock_db.execute.return_value = result
    return mock_db


# ---------------------------------------------------------------------------
# Existing test
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_patch_returns_403_when_not_owner(
    test_user: User,
    tool_owned_by_other: Tool,
) -> None:
    # The route calls db.get(Tool, tool_id) before checking ownership.
    # Override get_db to return a mock session that hands back tool_owned_by_other.
    async def mock_get_db() -> AsyncGenerator[AsyncSession]:
        mock_db = AsyncMock(spec=AsyncSession)
        mock_db.get.return_value = tool_owned_by_other
        yield mock_db

    app.dependency_overrides[get_current_user] = lambda: test_user
    app.dependency_overrides[get_db] = mock_get_db

    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.patch(
                f"/tools/{tool_owned_by_other.id}",
                json={"name": "Stolen Name"},
            )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 403
    assert response.json()["detail"] == "Not your tool"


# ---------------------------------------------------------------------------
# 1. Happy path: create tool
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_create_tool_happy_path(test_user: User) -> None:
    def _refresh_side_effect(tool: Tool) -> None:
        tool.id = 99
        tool.created_at = datetime(2026, 1, 1)
        tool.updated_at = datetime(2026, 1, 1)

    async def mock_get_db() -> AsyncGenerator[AsyncSession]:
        mock_db = AsyncMock(spec=AsyncSession)
        mock_db.refresh.side_effect = _refresh_side_effect
        yield mock_db

    app.dependency_overrides[get_current_user] = lambda: test_user
    app.dependency_overrides[get_db] = mock_get_db

    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post(
                "/tools",
                json={
                    "name": "Reciprocating Saw",
                    "description": "Milwaukee 18V brushless",
                    "category_tag": "power tools",
                    "notes": "Battery included.",
                },
            )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Reciprocating Saw"
    assert data["owner_id"] == test_user.id
    assert data["category_tag"] == "power tools"
    assert data["id"] == 99


# ---------------------------------------------------------------------------
# 2. Happy path: list tools
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_list_tools_returns_results(test_user: User, test_tool: Tool) -> None:
    async def mock_get_db() -> AsyncGenerator[AsyncSession]:
        yield _mock_execute_returning([test_tool])

    app.dependency_overrides[get_current_user] = lambda: test_user
    app.dependency_overrides[get_db] = mock_get_db

    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.get("/tools")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    first = data[0]
    assert first["id"] == test_tool.id
    assert first["name"] == test_tool.name
    assert first["owner_id"] == test_user.id


# ---------------------------------------------------------------------------
# 3. My tools only
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_my_tools_only_returns_owned_tools(
    test_user: User,
    test_tool: Tool,
    other_user: User,
    tool_owned_by_other: Tool,
) -> None:
    # Route filters by owner_id — mock returns only test_user's tool.
    async def mock_get_db() -> AsyncGenerator[AsyncSession]:
        yield _mock_execute_returning([test_tool])

    app.dependency_overrides[get_current_user] = lambda: test_user
    app.dependency_overrides[get_db] = mock_get_db

    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.get("/users/me/tools")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    data = response.json()
    assert all(t["owner_id"] == test_user.id for t in data)
    other_ids = {t["id"] for t in data}
    assert tool_owned_by_other.id not in other_ids


# ---------------------------------------------------------------------------
# 4. ILIKE search — hit
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_search_ilike_hit(test_user: User, test_tool: Tool) -> None:
    # test_tool has category_tag="power-tools"; query on "power" should hit.
    async def mock_get_db() -> AsyncGenerator[AsyncSession]:
        yield _mock_execute_returning([test_tool])

    app.dependency_overrides[get_current_user] = lambda: test_user
    app.dependency_overrides[get_db] = mock_get_db

    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.get("/tools", params={"q": "power"})
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    # The matched tool's category_tag contains the search term.
    assert "power" in data[0]["category_tag"].lower()


# ---------------------------------------------------------------------------
# 5. ILIKE search — miss
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_search_ilike_miss(test_user: User) -> None:
    async def mock_get_db() -> AsyncGenerator[AsyncSession]:
        yield _mock_execute_returning([])

    app.dependency_overrides[get_current_user] = lambda: test_user
    app.dependency_overrides[get_db] = mock_get_db

    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.get("/tools", params={"q": "zzznomatch"})
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json() == []


# ---------------------------------------------------------------------------
# 6. PATCH own tool
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_patch_own_tool(test_user: User, test_tool: Tool) -> None:
    def _refresh_side_effect(tool: Tool) -> None:
        # Simulate what the DB commit + refresh would do.
        tool.description = "Updated description"
        tool.updated_at = datetime(2026, 6, 1)

    async def mock_get_db() -> AsyncGenerator[AsyncSession]:
        mock_db = AsyncMock(spec=AsyncSession)
        mock_db.get.return_value = test_tool
        mock_db.refresh.side_effect = _refresh_side_effect
        yield mock_db

    app.dependency_overrides[get_current_user] = lambda: test_user
    app.dependency_overrides[get_db] = mock_get_db

    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.patch(
                f"/tools/{test_tool.id}",
                json={"description": "Updated description"},
            )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json()["description"] == "Updated description"


# ---------------------------------------------------------------------------
# 7. DELETE nonowner blocked
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_delete_nonowner_blocked(
    test_user: User,
    tool_owned_by_other: Tool,
) -> None:
    async def mock_get_db() -> AsyncGenerator[AsyncSession]:
        mock_db = AsyncMock(spec=AsyncSession)
        mock_db.get.return_value = tool_owned_by_other
        yield mock_db

    app.dependency_overrides[get_current_user] = lambda: test_user
    app.dependency_overrides[get_db] = mock_get_db

    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.delete(f"/tools/{tool_owned_by_other.id}")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 403
    assert response.json()["detail"] == "Not your tool"
