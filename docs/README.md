# ユーザー管理システム 実装ガイド

## 概要

来月から参加するプロジェクトの技術スタックを事前学習するため、**ユーザー管理システム**を段階的に構築するハンズオンガイドです。

各ステップで1つの技術にフォーカスし、以下の3つの観点から理解を深めます：

1. **なぜその技術を使うのか**（設計意図・背景）
2. **どう実装するのか**（コードと詳細解説）
3. **何に注意すべきか**（よくある落とし穴・トラブルシューティング）

---

## 技術スタック

| カテゴリ | ライブラリ | バージョン | 役割 |
|---------|-----------|-----------|------|
| UI Framework | React | ^17.0.2 | コンポーネントベースのUI構築 |
| Language | TypeScript | ^4.9.5 | 静的型付けによる安全性向上 |
| UI Components | @mui/material | v5 | Googleマテリアルデザイン準拠のUIキット |
| Routing | react-router-dom | v5 | クライアントサイドルーティング |
| State Management | zustand | v4 | 軽量グローバル状態管理 |
| Form | react-hook-form | v7 | 高パフォーマンスフォーム制御 |
| Validation | yup + @hookform/resolvers | - | スキーマベースバリデーション |
| Data Fetching | @tanstack/react-query | v4 | サーバー状態管理・キャッシュ |
| HTTP Client | axios | - | HTTPリクエスト |
| Table | @tanstack/react-table | v8 | ヘッドレステーブルロジック |
| Mock API | json-server | v0 | RESTful APIモック |

> **React 17互換性メモ:** MUI v5、React Query v4、React Router v5 は React 17 をサポートする最後のメジャーバージョン。v6以降はReact 18が必須。

---

## ディレクトリ構成（Features設計）

```
src/
├── api/                        # Axios instance, API関数
│   ├── client.ts               # Axios共通設定
│   └── users.ts                # ユーザーAPI関数
├── features/
│   └── users/
│       ├── components/         # ユーザー機能のUIコンポーネント
│       │   ├── UserTable.tsx
│       │   ├── UserForm.tsx
│       │   └── UserDetail.tsx
│       ├── hooks/              # React Query カスタムフック
│       │   └── useUsers.ts
│       ├── types/              # 型定義
│       │   └── index.ts
│       ├── validation/         # Yupバリデーションスキーマ
│       │   └── userSchema.ts
│       └── pages/              # ページコンポーネント
│           ├── UserListPage.tsx
│           └── UserFormPage.tsx
├── stores/                     # Zustand ストア
│   └── useAppStore.ts
├── components/                 # 共通コンポーネント
│   └── Layout.tsx
├── App.tsx
└── index.tsx
```

### なぜFeatures設計を採用するのか

| 設計パターン | 特徴 | 適したプロジェクト |
|-------------|------|-------------------|
| **Flat構造** | 種類別にまとめる（components/, hooks/, etc.） | 小規模、機能が少ない |
| **Features設計** | 機能単位でまとめる（features/users/, etc.） | 中〜大規模、機能が多い |
| **Atomic Design** | UIの粒度で分類（atoms, molecules, etc.） | デザインシステム構築時 |

**Features設計のメリット：**
- 関連ファイルが近くにあるため、コードの追跡が容易
- 機能ごとに独立しているため、他チームの影響を受けにくい
- 機能追加時に影響範囲が限定される

**境界の考え方：**
- `features/` → その機能専用のコード
- `src/components/` → 複数の機能で使う共通コンポーネント
- `src/api/` → 複数の機能で使うAPI設定

---

## ステップ一覧

| Step | タイトル | 学ぶ技術 | 所要時間目安 |
|------|---------|---------|-------------|
| [Step 1](./step-1-mui-router.md) | 環境構築 + Material UI基盤 | MUI v5, React Router v5 | 30分 |
| [Step 2](./step-2-api-axios.md) | json-server + Axios + 型定義 | REST API, Axios, TypeScript | 30分 |
| [Step 3](./step-3-react-query.md) | React Query + ユーザー一覧 | React Query, キャッシュ | 45分 |
| [Step 4](./step-4-tanstack-table.md) | TanStack Table | ヘッドレスUI, ソート/フィルタ | 45分 |
| [Step 5](./step-5-form-validation.md) | React Hook Form + Yup | フォーム, バリデーション | 45分 |
| [Step 6](./step-6-zustand.md) | Zustand | グローバル状態管理 | 30分 |
| [Step 7](./step-7-finishing.md) | 仕上げ | ダイアログ, エラーハンドリング | 30分 |

---

## 学習の進め方

### 推奨アプローチ

1. **ステップ順に進める**
   - 各ステップは前のステップの完了を前提としている
   - 特にStep 1〜3は基盤となるため、必ず順番通りに

2. **「なぜ」を意識する**
   - 各技術の採用理由を理解してからコードを書く
   - 比較表で他の選択肢との違いを把握する

3. **動作確認を必ず行う**
   - 各ステップ末尾の「動作確認」チェックリストを実行
   - エラーが出たら「トラブルシューティング」を参照

4. **コードを写経ではなく理解する**
   - 「コード解説」表で各行の意味を確認
   - 自分の言葉で説明できるか試す

### 完成後の確認ポイント

以下の質問に答えられれば、このハンズオンの目的を達成しています：

1. **React Query**: `useQuery` と `useMutation` の違いは？`invalidateQueries` は何をしている？
2. **TanStack Table**: ヘッドレスUIのメリットは？`accessor` と `display` カラムの違いは？
3. **React Hook Form**: なぜMUIとの連携に `Controller` が必要？
4. **Yup**: `resolver` パターンのメリットは？
5. **Zustand**: Redux と比べてどこがシンプル？
6. **Axios**: インスタンスを作るメリットは？
7. **Features設計**: 機能単位でディレクトリを分ける理由は？

---

## 開発環境のセットアップ

### 必要なツール

- Node.js (v16以上推奨)
- npm または yarn
- お好みのエディタ（VSCode推奨）

### 起動コマンド

```bash
# 開発サーバー起動（port 3000）
npm start

# モックAPIサーバー起動（port 3001）
npm run server

# または両方同時起動
npm run dev

# テスト実行
npm test

# プロダクションビルド
npm run build
```

---

## 困ったときは

各ステップに「よくある質問・トラブルシューティング」セクションがあります。
それでも解決しない場合は：

1. エラーメッセージをよく読む
2. ブラウザのDevTools（Console, Network）を確認
3. 該当ライブラリの公式ドキュメントを参照

---

**さあ、[Step 1](./step-1-mui-router.md) から始めましょう！**
