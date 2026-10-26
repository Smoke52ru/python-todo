from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlmodel import Session

from backend import repository
from backend.db import get_session
from backend.schemas import (
    SortField,
    SortOrder,
    TodoBulkUpdate,
    TodoCreate,
    TodoListResponse,
    TodoRead,
    TodoUpdate,
)

router = APIRouter(prefix="/todos", tags=["todos"])
SessionDep = Annotated[Session, Depends(get_session)]


@router.get("", response_model=TodoListResponse)
def list_todos(
    session: SessionDep,
    response: Response,
    q: str | None = None,
    done: bool | None = None,
    limit: Annotated[int, Query(ge=1, le=200)] = 50,
    offset: Annotated[int, Query(ge=0)] = 0,
    sort: SortField = "created_at",
    order: SortOrder = "desc",
) -> TodoListResponse:
    search = q.strip() if q else None
    if search == "":
        search = None

    items, total = repository.list_todos(
        session,
        q=search,
        done=done,
        limit=limit,
        offset=offset,
        sort=sort,
        order=order,
    )
    response.headers["X-Total-Count"] = str(total)
    return TodoListResponse(
        items=[TodoRead.model_validate(item) for item in items],
        total=total,
        limit=limit,
        offset=offset,
    )


@router.get("/{todo_id}", response_model=TodoRead)
def get_todo(todo_id: int, session: SessionDep) -> TodoRead:
    todo = repository.get_todo(session, todo_id)
    if todo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found"
        )
    return TodoRead.model_validate(todo)


@router.post("", response_model=TodoRead, status_code=status.HTTP_201_CREATED)
def create_todo(payload: TodoCreate, session: SessionDep) -> TodoRead:
    todo = repository.create_todo(session, payload)
    return TodoRead.model_validate(todo)


@router.patch("/{todo_id}", response_model=TodoRead)
def update_todo(todo_id: int, payload: TodoUpdate, session: SessionDep) -> TodoRead:
    todo = repository.get_todo(session, todo_id)
    if todo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found"
        )
    updated = repository.update_todo(session, todo, payload)
    return TodoRead.model_validate(updated)


@router.delete("/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_todo(todo_id: int, session: SessionDep) -> Response:
    todo = repository.get_todo(session, todo_id)
    if todo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found"
        )
    repository.delete_todo(session, todo)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.patch("", response_model=dict)
def bulk_update_todos(payload: TodoBulkUpdate, session: SessionDep) -> dict:
    updated = repository.bulk_set_done(session, payload.done)
    return {"updated": updated, "done": payload.done}


@router.delete("", response_model=dict)
def bulk_delete_todos(
    session: SessionDep,
    done: Annotated[bool, Query()] = True,
) -> dict:
    deleted = repository.delete_by_done(session, done)
    return {"deleted": deleted, "done": done}
