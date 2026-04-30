from datetime import datetime

from pydantic import BaseModel, ConfigDict

from models.user import Role


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    clerk_id: str | None
    email: str
    display_name: str
    phone: str | None
    address: str | None
    role: Role
    created_at: datetime
