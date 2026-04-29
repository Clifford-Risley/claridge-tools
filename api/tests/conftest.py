import os

# Set before any app module is imported so pydantic-settings can build Settings().
# Tests that exercise the DB layer should override this or use a real test database.
os.environ.setdefault("DATABASE_URL", "postgresql+asyncpg://test:test@localhost:5432/test")
