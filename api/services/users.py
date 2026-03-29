from datetime import datetime, timezone
from schemas.user import UserCreate

_users: dict[int, dict] = {}
_next_id: int = 1

def reset():
    global _next_id
    _users.clear()
    _next_id = 1

def get_all() -> list[dict]:
    return list(_users.values())

def create(body: UserCreate) -> dict:
    global _next_id
    user = {**body.model_dump(), "id": _next_id, "createdAt": datetime.now(timezone.utc)}
    _users[_next_id] = user
    _next_id += 1
    return user