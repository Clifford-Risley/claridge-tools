from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ToolCreate(BaseModel):
    name: str
    description: str | None = None
    category_tag: str | None = None
    notes: str | None = None


class ToolUpdate(BaseModel):
    """All fields optional — only provided fields are written to the database."""

    name: str | None = None
    description: str | None = None
    category_tag: str | None = None
    notes: str | None = None


class ToolRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    owner_id: int
    name: str
    description: str | None
    category_tag: str | None
    notes: str | None
    created_at: datetime
    updated_at: datetime
