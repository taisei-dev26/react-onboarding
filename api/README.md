# API - FastAPI Backend

React Onboarding プロジェクトのバックエンドAPI。

## セットアップ

```bash
# 仮想環境の作成
python -m venv venv

# 仮想環境の有効化
# macOS/Linux:
source venv/bin/activate
# Windows:
# venv\Scripts\activate

# 依存パッケージのインストール
pip install -r requirements.txt

# 環境変数の設定
cp .env.example .env
# .env ファイルを編集して必要な値を設定
```

## 起動

```bash
# 開発サーバー起動（ホットリロード有効）
uvicorn main:app --reload --port 8000

# または
python -m uvicorn main:app --reload --port 8000
```

APIドキュメント:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## プロジェクト構造

```
api/
├── main.py              # アプリケーションエントリーポイント
├── requirements.txt     # Python依存パッケージ
├── .env.example         # 環境変数テンプレート
├── models/              # SQLAlchemyモデル
├── schemas/             # Pydanticスキーマ
├── routers/             # APIルーター
├── services/            # ビジネスロジック
└── database.py          # データベース接続設定
```

## API エンドポイント

### Users
- `GET /api/users` - ユーザー一覧取得
- `POST /api/users` - ユーザー作成
- `GET /api/users/{id}` - ユーザー詳細取得
- `PUT /api/users/{id}` - ユーザー更新
- `DELETE /api/users/{id}` - ユーザー削除

## 技術スタック

- **FastAPI** - モダンで高速なWebフレームワーク
- **Pydantic** - データバリデーション
- **SQLAlchemy** - ORM
- **Uvicorn** - ASGIサーバー
