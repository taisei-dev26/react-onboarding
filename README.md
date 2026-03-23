# React Onboarding

React + TypeScript (Frontend) + FastAPI (Backend) の学習用オンボーディングプロジェクト。
ユーザー管理 CRUD アプリケーションを段階的に構築していきます。

## 📚 学習の進め方

1. `docs/implementation-guide.md` を参照して段階的に実装
2. 各ステップごとにコミット
3. 実装ガイドのチェックリストを完了させていく

## 🚀 クイックスタート

### 前提条件

- Node.js 16.x 以上
- Python 3.9 以上
- npm 7.x 以上

### セットアップ

```bash
# リポジトリのクローン
git clone <your-repo-url>
cd react-onboarding

# フロントエンドのセットアップ
cd frontend
npm install

# バックエンドのセットアップ
cd ../api
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

### 開発サーバーの起動

#### フロントエンド (React)

```bash
cd frontend
npm start
```

→ http://localhost:3000 でアプリケーションが起動

#### バックエンド (FastAPI)

```bash
cd api
source venv/bin/activate  # Windows: venv\Scripts\activate
uvicorn main:app --reload --port 8000
```

→ http://localhost:8000 で API が起動
→ http://localhost:8000/docs で Swagger UI が利用可能

#### モック API サーバー（オプション）

```bash
cd frontend
npm run server
```

→ http://localhost:3001 で json-server が起動

## 📁 プロジェクト構造

```
react-onboarding/
├── frontend/               # React アプリケーション
│   ├── src/
│   │   ├── api/            # API クライアント設定
│   │   ├── components/     # 共通コンポーネント
│   │   ├── features/       # 機能別モジュール
│   │   │   └── users/      # ユーザー管理機能
│   │   ├── stores/         # グローバル状態管理
│   │   └── App.tsx
│   ├── public/
│   └── package.json
│
├── api/                    # FastAPI バックエンド
│   ├── main.py             # エントリーポイント
│   ├── models/             # SQLAlchemy モデル
│   ├── schemas/            # Pydantic スキーマ
│   ├── routers/            # API ルーター
│   ├── services/           # ビジネスロジック
│   └── requirements.txt
│
└── docs/                   # ドキュメント
    ├── implementation-guide.md
    ├── api-spec.md
    └── component-design.md
```

## 🛠 技術スタック

### Frontend

- React 17.x + TypeScript 4.9
- React Router v5
- Material-UI (MUI) v5
- React Query v4 (サーバー状態)
- Zustand v4 (グローバル UI 状態)
- React Hook Form v7 + Yup
- TanStack Table v8
- Axios

### Backend

- FastAPI
- Pydantic (データバリデーション)
- SQLAlchemy (ORM)
- Uvicorn (ASGI サーバー)

## 📖 ドキュメント

- [実装ガイド](docs/implementation-guide.md) - 段階的な実装手順
- [API 仕様](docs/api-spec.md) - モック API の詳細
- [コンポーネント設計](docs/component-design.md) - UI コンポーネント構成
- [Frontend README](frontend/README.md) - フロントエンド詳細
- [API README](api/README.md) - バックエンド詳細

## 🎯 学習目標

このプロジェクトを通じて以下を習得します：

### Frontend

1. React の基礎（コンポーネント設計、Hooks）
2. TypeScript との統合
3. 状態管理（React Query, Zustand）
4. フォーム処理（React Hook Form, Yup）
5. UI ライブラリ（Material-UI）
6. API 連携とデータフェッチング

### Backend

1. FastAPI の基礎
2. RESTful API 設計
3. Pydantic によるバリデーション
4. SQLAlchemy による ORM
5. 認証・認可
6. CORS 設定

## 📝 開発ガイドライン

### コミットメッセージ

プレフィックスを使用した Conventional Commits 形式を推奨：

- `feat:` 新機能
- `fix:` バグ修正
- `docs:` ドキュメント
- `style:` フォーマット
- `refactor:` リファクタリング
- `test:` テスト
- `chore:` その他

### コードスタイル

- Frontend: Prettier による自動フォーマット
- Backend: Black, isort, flake8 推奨
- TypeScript strict mode 有効

## 🤝 コントリビューション

このプロジェクトは学習用です。自由に Fork してカスタマイズしてください。

## 📄 ライセンス

MIT
