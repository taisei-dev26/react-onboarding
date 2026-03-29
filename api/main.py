from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from schemas.user import User, UserCreate
from services import users as users_service

app = FastAPI(
    title="React Onboarding API",
    description="User management API built with FastAPI",
    version="1.0.0"
)

# CORS設定 - フロントエンドからのアクセスを許可
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React開発サーバー
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """ヘルスチェックエンドポイント"""
    return {"message": "React Onboarding API is running"}


@app.get("/api/health")
async def health_check():
    """APIヘルスチェック"""
    return {"status": "healthy"}

@app.get("/api/users", response_model=list[User])
def list_users():
    return users_service.get_all()

@app.post("/api/users", response_model=User, status_code=201)
def create_user(body: UserCreate):
    return users_service.create(body)