from fastapi import APIRouter
from schemas.user import User, UserCreate
from datetime import datetime, timezone

router = APIRouter(prefix="/api/users", tags=["users"])

_users: dict[int, dict] = {}

@router.get("",  response_model=list[User])
def list_users():
    return list(_users.values())

_next_id: int = 1

@router.post("", response_model=User, status_code=201)
def create_user(body: UserCreate):
    global _next_id
    user = {**body.model_dump(), "id": _next_id, "createdAt": datetime.now(timezone.utc)}
    _users[_next_id] = user
    _next_id += 1
    return user