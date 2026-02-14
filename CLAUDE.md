# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

React + TypeScript のオンボーディングプロジェクト。ユーザー管理CRUDアプリケーションを段階的に構築する学習用リポジトリ。
実装ガイドは `docs/implementation-guide.md` に記載（7ステップの段階的実装）。

## Commands

```bash
npm start              # 開発サーバー起動 (port 3000)
npm run build          # プロダクションビルド
npm test               # テスト実行 (watch mode)
npm test -- --coverage # カバレッジ付きテスト
npx json-server --watch db.json --port 3001  # モックAPIサーバー起動
```

## Tech Stack & Version Constraints

- **React 17** with new JSX transform (React importは不要)
- **TypeScript 4.9** strict mode有効
- **React Router v5** (`<Switch>`, `<Route>`, `useHistory()` — v6のAPIとは異なる)
- **MUI v5** + Emotion (`sx` prop, `<ThemeProvider>`)
- **React Query v4** (`@tanstack/react-query` — v5のAPIとは異なる)
- **Zustand v4** (グローバルUI状態: 通知、サイドバー)
- **React Hook Form v7** + Yup (フォーム + バリデーション)
- **TanStack Table v8** (ヘッドレステーブル: ソート、フィルタ、ページネーション)
- **Axios** (HTTPクライアント、カスタムインスタンス)
- **json-server 0.17** (モックREST API, port 3001)
- **Testing Library** + Jest (react-scripts経由)

## Architecture

Feature-based ディレクトリ構成:

```
src/
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

## Mock API

json-serverが `db.json` をもとにREST APIを提供する（port 3001）。

```
User: { id, name, email, role: 'admin'|'editor'|'viewer', department, createdAt }
```

エンドポイント: `GET/POST /users`, `GET/PUT/DELETE /users/:id`
