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

# 依存パッケージのインストール（本番用）
pip install -r requirements.txt

# 開発用パッケージのインストール（テスト・Lintツール含む）
pip install -r requirements-dev.txt

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

## テスト

```bash
# すべてのテストを実行
pytest

# カバレッジレポート付きで実行
pytest --cov

# 特定のマーカーのテストのみ実行
pytest -m unit        # ユニットテストのみ
pytest -m integration # 統合テストのみ

# 詳細な出力で実行
pytest -v

# 特定のテストファイルを実行
pytest tests/test_main.py

# 特定のテスト関数を実行
pytest tests/test_main.py::test_read_root

# カバレッジHTMLレポート生成
pytest --cov --cov-report=html
# → htmlcov/index.html を開いて確認
```

### テストの書き方

```python
import pytest

@pytest.mark.unit
def test_example(client):
    """テスト関数は test_ で始める必要がある"""
    response = client.get("/api/endpoint")
    assert response.status_code == 200
    assert response.json() == {"key": "value"}
```

## プロジェクト構造

```
api/
├── main.py              # アプリケーションエントリーポイント
├── requirements.txt     # Python依存パッケージ（本番）
├── requirements-dev.txt # 開発用依存パッケージ
├── pytest.ini           # pytest設定
├── .env.example         # 環境変数テンプレート
├── models/              # SQLAlchemyモデル
├── schemas/             # Pydanticスキーマ
├── routers/             # APIルーター
├── services/            # ビジネスロジック
├── database.py          # データベース接続設定
└── tests/               # テストコード
    ├── conftest.py      # pytestフィクスチャ
    └── test_*.py        # テストファイル
```

## API エンドポイント

### Users
- `GET /api/users` - ユーザー一覧取得
- `POST /api/users` - ユーザー作成
- `GET /api/users/{id}` - ユーザー詳細取得
- `PUT /api/users/{id}` - ユーザー更新
- `DELETE /api/users/{id}` - ユーザー削除

## 技術スタック

### 本番
- **FastAPI** - モダンで高速なWebフレームワーク
- **Pydantic** - データバリデーション
- **SQLAlchemy** - ORM
- **Uvicorn** - ASGIサーバー

### 開発・テスト
- **pytest** - テストフレームワーク
- **pytest-cov** - カバレッジ測定
- **pytest-asyncio** - 非同期テストサポート
- **httpx** - TestClient用HTTPクライアント
- **black** - コードフォーマッター
- **isort** - import文の整理
- **flake8** - Linter
- **mypy** - 型チェック
