# Step 7: 仕上げ

## このステップで学ぶこと

- MUI Dialog による確認ダイアログの実装
- ユーザー体験の向上（window.confirm からの移行）
- 全体の振り返りと学習ポイント

---

## なぜ確認ダイアログを改善するのか

### 課題

Step 4で使用した `window.confirm` はブラウザ標準のダイアログ：

```tsx
// ❌ window.confirm（カスタマイズ不可）
if (window.confirm('このユーザーを削除しますか？')) {
  deleteUserMutation.mutate(id);
}
```

**問題点:**
- ブラウザによって見た目が異なる
- スタイリングできない
- ユーザー名など動的情報を含めにくい
- アプリのデザインと統一感がない

### 解決策

MUI Dialog を使用して、アプリケーションに統合されたダイアログを作成する。

---

## 実装手順

### 7-1. 削除確認ダイアログ

#### 背景・目的
削除操作の確認ダイアログを MUI コンポーネントで作成する。ユーザー名を表示し、誤削除を防ぐ。

#### コード

**`src/features/users/components/DeleteConfirmDialog.tsx`** を新規作成：

```tsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';

type DeleteConfirmDialogProps = {
  open: boolean;
  userName: string;
  onConfirm: () => void;
  onCancel: () => void;
};

const DeleteConfirmDialog = ({
  open,
  userName,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) => {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>ユーザー削除の確認</DialogTitle>
      <DialogContent>
        <DialogContentText>
          「{userName}」を削除しますか？この操作は取り消せません。
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>キャンセル</Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          削除
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmDialog;
```

#### コード解説

| 行 | コード | 説明 |
|----|--------|------|
| 2-7 | MUI Dialog コンポーネント群 | ダイアログを構成するパーツ |
| 10-15 | `DeleteConfirmDialogProps` | コンポーネントのプロパティ型 |
| 11 | `open: boolean` | ダイアログの表示/非表示 |
| 12 | `userName: string` | 削除対象のユーザー名 |
| 13-14 | `onConfirm/onCancel` | ボタンクリック時のコールバック |
| 24 | `<Dialog open={...} onClose={...}>` | 開閉状態と背景クリック時の処理 |
| 25 | `<DialogTitle>` | ダイアログのタイトル |
| 26-29 | `<DialogContent>` | ダイアログの本文 |
| 30-35 | `<DialogActions>` | ダイアログのアクションボタン領域 |
| 33 | `color="error" variant="contained"` | 赤い塗りつぶしボタン（危険操作を示す） |

#### MUI Dialog の構造

```
┌─────────────────────────────────────────┐
│ <Dialog>                                │
│ ┌─────────────────────────────────────┐ │
│ │ <DialogTitle>                       │ │
│ │   ユーザー削除の確認                   │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ <DialogContent>                     │ │
│ │   <DialogContentText>               │ │
│ │     「田中太郎」を削除しますか？...      │ │
│ │   </DialogContentText>              │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ <DialogActions>                     │ │
│ │   [キャンセル]    [削除]              │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

### 7-2. UserListPageの削除処理を改善

#### 背景・目的
`window.confirm` を `DeleteConfirmDialog` に置き換え、より良いユーザー体験を提供する。

#### コード

**`src/features/users/pages/UserListPage.tsx`** を更新：

```tsx
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useUsers, useDeleteUser } from '../hooks/useUsers';
import UserTable from '../components/UserTable';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';

const UserListPage = () => {
  const history = useHistory();
  const { data: users, isLoading, isError, error } = useUsers();
  const deleteUserMutation = useDeleteUser();

  // 削除対象の状態管理
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);

  // 削除ダイアログを開く
  const handleDelete = (id: number) => {
    const user = users?.find((u) => u.id === id);
    if (user) {
      setDeleteTarget({ id: user.id, name: user.name });
    }
  };

  // 削除を実行
  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteUserMutation.mutate(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        ユーザーの取得に失敗しました: {(error as Error).message}
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">ユーザー一覧</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => history.push('/users/new')}
        >
          ユーザー登録
        </Button>
      </Box>

      <UserTable users={users ?? []} onDelete={handleDelete} />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        userName={deleteTarget?.name ?? ''}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  );
};

export default UserListPage;
```

#### コード解説

| 行 | コード | 説明 |
|----|--------|------|
| 15 | `useState<{...} ｜ null>(null)` | 削除対象を保持。nullならダイアログは閉じている |
| 18-23 | `handleDelete` | テーブルの削除ボタンクリック時。ユーザー情報を設定してダイアログを開く |
| 19 | `users?.find((u) => u.id === id)` | IDからユーザー情報を検索 |
| 26-31 | `handleConfirmDelete` | ダイアログの「削除」クリック時。実際に削除を実行 |
| 63 | `open={!!deleteTarget}` | deleteTargetがあれば開く |
| 64 | `userName={deleteTarget?.name ?? ''}` | オプショナルチェイニングとnullish合体演算子 |
| 66 | `onCancel={() => setDeleteTarget(null)}` | キャンセル時にdeletTargetをクリア |

#### 状態遷移

```
初期状態: deleteTarget = null
         ↓
[削除ボタンクリック]
         ↓
deleteTarget = { id: 1, name: "田中太郎" }
         ↓
ダイアログ表示（open={true}）
         ↓
┌────────────────────────────────────┐
│ [キャンセル]クリック                   │
│    ↓                                │
│ setDeleteTarget(null)               │
│    ↓                                │
│ ダイアログ閉じる                       │
└────────────────────────────────────┘
         OR
┌────────────────────────────────────┐
│ [削除]クリック                        │
│    ↓                                │
│ deleteUserMutation.mutate(id)       │
│ setDeleteTarget(null)               │
│    ↓                                │
│ ダイアログ閉じる                       │
│ 一覧が更新される                       │
│ 通知が表示される                       │
└────────────────────────────────────┘
```

---

## 動作確認（最終）

### 全体の確認項目

**一覧ページ:**
- [ ] ユーザー一覧がテーブルで表示される
- [ ] カラムヘッダークリックでソートできる
- [ ] 検索ボックスでフィルタできる
- [ ] ページネーションが動作する
- [ ] 「ユーザー登録」ボタンで新規登録ページに遷移

**新規登録ページ:**
- [ ] フォームが空の状態で表示される
- [ ] 空欄で送信するとバリデーションエラー
- [ ] 正しく入力して送信すると一覧に戻る
- [ ] 「ユーザーを作成しました」通知が表示される

**編集ページ:**
- [ ] 既存データがフォームに入っている
- [ ] 編集して保存すると一覧に反映される
- [ ] 「ユーザーを更新しました」通知が表示される

**削除:**
- [ ] 削除ボタンでダイアログが表示される
- [ ] ダイアログにユーザー名が表示される
- [ ] 「キャンセル」でダイアログが閉じる
- [ ] 「削除」で実際に削除される
- [ ] 「ユーザーを削除しました」通知が表示される

**共通:**
- [ ] サイドバーでページ遷移できる
- [ ] 通知が4秒後に自動で消える
- [ ] ✕ボタンで通知を手動で閉じられる

---

## 完成後の学習ポイント

以下の質問に答えられれば、このハンズオンの目的を達成しています：

### 1. React Query

**Q: `useQuery` と `useMutation` の違いは？**

A:
- `useQuery` → データ取得（GET）。自動でキャッシュ、再取得、ローディング管理
- `useMutation` → データ変更（POST/PUT/DELETE）。成功/失敗時のコールバック

**Q: `invalidateQueries` は何をしている？**

A: 指定したキーのキャッシュを「古い」とマークし、自動的に再取得をトリガーする。データ変更後に一覧を最新化するために使う。

### 2. TanStack Table

**Q: ヘッドレスUIのメリットは？**

A:
- ロジック（ソート、フィルタ、ページネーション）とUI（見た目）を分離
- 好きなUIライブラリ（MUI, Chakra等）と組み合わせ可能
- デザインの自由度が高い

**Q: `accessor` と `display` カラムの違いは？**

A:
- `accessor` → データフィールドに紐づく。ソート・フィルタ可能
- `display` → データに紐づかない表示専用（操作ボタン等）

### 3. React Hook Form

**Q: なぜMUIとの連携に `Controller` が必要？**

A: MUI TextField は内部で状態管理する「制御コンポーネント」。React Hook Form のデフォルト（`register`）は非制御コンポーネント向け。`Controller` が両者を橋渡しする。

**Q: `register` との違いは？**

A:
- `register` → ネイティブ input 向け、ref で DOM を直接参照
- `Controller` → 制御コンポーネント向け、value/onChange を経由

### 4. Yup

**Q: `resolver` パターンのメリットは？**

A:
- バリデーションルールをコンポーネント外で管理
- Yup, Zod 等、好きなライブラリを使える
- ルールの再利用、テストが容易

### 5. Zustand

**Q: Redux と比べてどこがシンプル？**

A:
- Provider 不要
- アクションタイプ定義不要
- ボイラープレートが極めて少ない
- 学習コストが低い

**Q: `getState()` とセレクタの使い分けは？**

A:
- `useStore((s) => s.xxx)` → コンポーネント内で購読（再レンダリング発生）
- `useStore.getState().xxx` → イベントハンドラ内で使用（再レンダリングなし）

### 6. Axios

**Q: インスタンスを作るメリットは？**

A:
- `baseURL` を一箇所で設定
- 共通ヘッダーを一箇所で設定
- インターセプターで共通処理を集約
- 環境ごとの切り替えが容易

**Q: `interceptors` はどんな場面で使う？**

A:
- リクエスト前: 認証トークンの付与
- レスポンス後: エラーログ、401時の自動ログアウト

### 7. Features設計

**Q: 機能単位でディレクトリを分ける理由は？**

A:
- 関連ファイルが近くにあり、追跡が容易
- 機能ごとに独立しており、影響範囲が限定される
- チーム開発で担当分けがしやすい

**Q: 共通コンポーネントとの境界は？**

A:
- `features/xxx/` → その機能専用
- `src/components/` → 複数の機能で使う共通部品
- `src/api/` → 複数の機能で使うAPI設定

---

## 技術スタック総まとめ

```
┌─────────────────────────────────────────────────────────────────┐
│                       ユーザー管理システム                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐                    │
│  │   React 17      │    │   TypeScript    │                    │
│  │  (UI Framework) │    │   (Type Safety) │                    │
│  └────────┬────────┘    └────────┬────────┘                    │
│           │                      │                              │
│           └──────────┬───────────┘                              │
│                      ↓                                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    MUI v5                                 │   │
│  │              (UI Components + Styling)                    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                 React Router v5                          │    │
│  │               (Client-side Routing)                      │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌──────────────────────┐    ┌──────────────────────┐          │
│  │    React Query v4    │    │      Zustand v4      │          │
│  │  (Server State Mgmt) │    │  (Client State Mgmt) │          │
│  │    キャッシュ・同期     │    │    通知・サイドバー     │          │
│  └───────────┬──────────┘    └──────────────────────┘          │
│              ↓                                                  │
│  ┌──────────────────────┐                                      │
│  │       Axios          │                                      │
│  │   (HTTP Client)      │                                      │
│  └───────────┬──────────┘                                      │
│              ↓                                                  │
│  ┌──────────────────────┐                                      │
│  │    json-server       │                                      │
│  │   (Mock REST API)    │                                      │
│  └──────────────────────┘                                      │
│                                                                 │
│  ┌──────────────────────┐    ┌──────────────────────┐          │
│  │   TanStack Table v8  │    │ React Hook Form v7   │          │
│  │  (Table Logic)       │    │  + Yup (Form + Val)  │          │
│  └──────────────────────┘    └──────────────────────┘          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 次のステップ

このハンズオンで学んだ技術を基に、さらに学習を深めるためのアイデア：

### 機能追加

1. **ユーザー詳細ページ** - URLパラメータからIDを取得して詳細表示
2. **検索条件の保存** - URLクエリパラメータで検索状態を維持
3. **ダークモード** - MUI テーマの切り替え
4. **ページ離脱確認** - フォーム編集中の離脱防止

### 技術深掘り

1. **React Query DevTools** - キャッシュの可視化
2. **カラム別フィルタ** - TanStack Table の `getFilteredRowModel`
3. **楽観的更新** - mutation の `onMutate` で先行反映
4. **Zustand Middleware** - devtools, persist

### テスト追加

1. **ユニットテスト** - React Testing Library
2. **コンポーネントテスト** - フォームバリデーション
3. **E2Eテスト** - Cypress または Playwright

---

**お疲れ様でした！このハンズオンを完了したあなたは、モダンなReactアプリケーション開発の基礎を身につけました。**

実際のプロジェクトでは、ここで学んだ技術の組み合わせ方や設計パターンを活かして、より複雑なアプリケーションを構築していくことになります。

質問があれば、各ステップの「よくある質問」セクションを参照するか、公式ドキュメントを確認してください。
