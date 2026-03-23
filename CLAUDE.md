# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

React + TypeScript (Frontend) + FastAPI (Backend) のオンボーディングプロジェクト。
ユーザー管理CRUDアプリケーションを段階的に構築する学習用リポジトリ。
実装ガイドは `docs/implementation-guide.md` に記載（7ステップの段階的実装）。

## Project Structure

```
react-onboarding/
├── frontend/     # React + TypeScript アプリケーション
├── api/          # FastAPI バックエンド
└── docs/         # ドキュメント
```

## Frontend Commands

```bash
cd frontend
npm start              # 開発サーバー起動 (port 3000)
npm run build          # プロダクションビルド
npm test               # テスト実行 (watch mode)
npm test -- --coverage # カバレッジ付きテスト
npm run server         # モックAPIサーバー起動 (port 3001)
```

## Backend Commands

```bash
cd api
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000  # 開発サーバー起動
```

API ドキュメント: http://localhost:8000/docs (Swagger UI)

## Frontend Tech Stack & Version Constraints

- **React 17** with new JSX transform (React importは不要)
- **TypeScript 4.9** strict mode有効
- **React Router v5** (`<Switch>`, `<Route>`, `useHistory()` — v6のAPIとは異なる)
- **MUI v5** + Emotion (`sx` prop, `<ThemeProvider>`)
- **React Query v4** (`@tanstack/react-query` — v5のAPIとは異なる)
- **Zustand v4** (グローバルUI状態: 通知、サイドバー)
- **React Hook Form v7** + Yup (フォーム + バリデーション)
- **TanStack Table v8** (ヘッドレステーブル: ソート、フィルタ、ページネーション)
- **Axios** (HTTPクライアント、カスタムインスタンス)
- **json-server 0.17** (モックREST API, port 3001) ※オプション
- **Testing Library** + Jest (react-scripts経由)

## Backend Tech Stack

- **FastAPI** - モダンなWebフレームワーク
- **Pydantic** - データバリデーション
- **SQLAlchemy** - ORM
- **Uvicorn** - ASGI サーバー
- **Python 3.9+**

## Frontend Architecture

Feature-based ディレクトリ構成:

```
frontend/src/
├── api/              # Axiosインスタンス, API関数
├── features/
│   └── users/
│       ├── components/  # UserTable, UserForm, UserDetail
│       ├── hooks/       # useUsers, useUser, mutations
│       ├── types/       # User, UserFormData
│       ├── validation/  # Yup schema
│       └── pages/       # UserListPage, UserFormPage
├── stores/           # Zustand stores
├── components/       # 共通コンポーネント (Layout, Snackbar)
├── App.tsx           # ルーティング設定
└── index.tsx         # エントリーポイント
```

**状態管理の使い分け:**
- サーバー状態 → React Query (データ取得・キャッシュ・同期)
- グローバルUI状態 → Zustand (通知、サイドバー開閉)
- ローカル状態 → React hooks (コンポーネント内)

## Backend Architecture

```
api/
├── main.py           # エントリーポイント、CORS設定
├── models/           # SQLAlchemy モデル
├── schemas/          # Pydantic スキーマ (リクエスト/レスポンス)
├── routers/          # API ルーター (エンドポイント定義)
├── services/         # ビジネスロジック
├── database.py       # DB接続設定
└── requirements.txt  # Python依存パッケージ
```

## API Endpoints

### Users API (FastAPI)
- `GET /api/users` - ユーザー一覧取得
- `POST /api/users` - ユーザー作成
- `GET /api/users/{id}` - ユーザー詳細取得
- `PUT /api/users/{id}` - ユーザー更新
- `DELETE /api/users/{id}` - ユーザー削除

User schema:
```
User: { id, name, email, role: 'admin'|'editor'|'viewer', department, createdAt }
```

### Mock API (json-server - オプション)
json-serverが `frontend/db.json` をもとにREST APIを提供する（port 3001）。
FastAPI 実装前の開発用。
