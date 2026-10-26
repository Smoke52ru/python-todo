from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator


class TodoCreate(BaseModel):
    body: str = Field(min_length=1, max_length=500)


class TodoUpdate(BaseModel):
    body: str | None = Field(default=None, min_length=1, max_length=500)
    done: bool | None = None

    @model_validator(mode="after")
    def require_at_least_one_field(self) -> "TodoUpdate":
        if self.body is None and self.done is None:
            raise ValueError("At least one of body or done must be provided")
        return self


class TodoBulkUpdate(BaseModel):
    done: bool


class TodoRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    body: str
    done: bool
    created_at: datetime
    updated_at: datetime


class TodoListResponse(BaseModel):
    items: list[TodoRead]
    total: int
    limit: int
    offset: int


class ErrorResponse(BaseModel):
    detail: str | list
    code: str


SortField = Literal["id", "created_at", "updated_at", "body"]
SortOrder = Literal["asc", "desc"]
