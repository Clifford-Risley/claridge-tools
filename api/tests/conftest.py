import os
from datetime import datetime

import pytest
from httpx import ASGITransport, AsyncClient

# Must be set before any app module is imported so pydantic-settings can build Settings().
os.environ.setdefault("DATABASE_URL", "postgresql+asyncpg://test:test@localhost:5432/test")

from deps import get_current_user  # noqa: E402 — import must follow env setup
from main import app
from models.tool import Tool
from models.user import Role, User


def _make_user(id: int, clerk_id: str, email: str, display_name: str) -> User:
    """Construct a transient User without a DB session.

    SQLAlchemy 2.x allows creating ORM instances in "transient" state — fully
    usable Python objects that haven't been associated with a session or flushed
    to the DB. Regular __init__ sets up the internal _sa_instance_state that
    instrumented attributes require; __new__ alone does not.
    """
    user = User(
        id=id,
        clerk_id=clerk_id,
        email=email,
        display_name=display_name,
        phone=None,
        address=None,
        role=Role.member,
    )
    user.created_at = datetime(2026, 1, 1)
    return user


def _make_tool(id: int, owner_id: int, name: str) -> Tool:
    tool = Tool(id=id, owner_id=owner_id, name=name)
    tool.created_at = datetime(2026, 1, 1)
    tool.updated_at = datetime(2026, 1, 1)
    return tool


@pytest.fixture
def test_user() -> User:
    return _make_user(1, "test_clerk_id", "test@claridge.local", "Test User")


@pytest.fixture
def other_user() -> User:
    """A second User — used to test ownership boundaries."""
    return _make_user(2, "other_clerk_id", "other@claridge.local", "Other User")


@pytest.fixture
def test_tool(test_user: User) -> Tool:
    tool = _make_tool(1, test_user.id, "Cordless Drill")
    tool.description = "DeWalt 20V"
    tool.category_tag = "power-tools"
    return tool


@pytest.fixture
def tool_owned_by_other(other_user: User) -> Tool:
    """A Tool owned by other_user — not accessible to test_user."""
    tool = _make_tool(2, other_user.id, "Tile Saw")
    tool.category_tag = "power-tools"
    return tool


@pytest.fixture
def client(test_user: User) -> AsyncClient:
    """Test client with get_current_user stubbed out.

    Routes that call Depends(get_current_user) receive test_user directly —
    no bearer token parsing, no DB lookup, no Clerk involved.
    """
    app.dependency_overrides[get_current_user] = lambda: test_user

    transport = ASGITransport(app=app)
    client = AsyncClient(transport=transport, base_url="http://test")

    yield client  # type: ignore[misc]

    app.dependency_overrides.clear()
