from collections.abc import AsyncGenerator
from unittest.mock import AsyncMock

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from db import get_db
from deps import get_current_user
from main import app
from models.tool import Tool
from models.user import User


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
