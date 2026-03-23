from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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


# ここから各エンドポイントを追加していく
# 例: /api/users エンドポイント
