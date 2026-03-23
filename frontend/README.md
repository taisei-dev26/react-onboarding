# Frontend - React Application

React Onboarding プロジェクトのフロントエンド。

## セットアップ

```bash
# 依存パッケージのインストール
npm install
```

## 起動

```bash
# 開発サーバー起動
npm start
# → http://localhost:3000

# json-server（モックAPI）起動
npm run server
# → http://localhost:3001

# フロントエンドとモックAPIを同時起動
npm run dev
```

## ビルド

```bash
npm run build      # プロダクションビルド
npm test           # テスト実行
npm test -- --coverage  # カバレッジ付きテスト
```

## Tech Stack

- **React 17** with new JSX transform
- **TypeScript 4.9** strict mode有効
- **React Router v5**
- **MUI v5** + Emotion
- **React Query v4** (サーバー状態管理)
- **Zustand v4** (グローバルUI状態)
- **React Hook Form v7** + Yup
- **TanStack Table v8**
- **Axios**

## プロジェクト構造

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

詳細は親ディレクトリの `docs/implementation-guide.md` を参照。
