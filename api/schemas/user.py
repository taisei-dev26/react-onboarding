from pydantic import BaseModel
from enum import Enum
from datetime import datetime

class UserRole(str, Enum):
    admin = "admin"
    editor = "editor"
    viewer = "viewer"

class User(BaseModel):
    id: int
    name: str
    email: str
    role: UserRole
    department: str
    createdAt: datetime

class UserCreate(BaseModel):
    name: str
    email: str
    role: UserRole
    department: str

