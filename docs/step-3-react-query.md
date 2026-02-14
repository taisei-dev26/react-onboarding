# Step 3: React Query + ユーザー一覧

## このステップで学ぶこと

- React Queryのコア概念（サーバー状態 vs クライアント状態）
- QueryClientの設定とオプション
- `useQuery` によるデータ取得
- `useMutation` によるデータ変更
- キャッシュ無効化（invalidateQueries）

---

## なぜReact Queryを使うのか

### 課題

従来の `useState` + `useEffect` によるデータ取得には多くのボイラープレートが必要：

```tsx
// ❌ 従来の方法（冗長）
const [users, setUsers] = useState<User[]>([]);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<Error | null>(null);

useEffect(() => {
  setIsLoading(true);
  fetchUsers()
    .then(data => setUsers(data))
    .catch(err => setError(err))
    .finally(() => setIsLoading(false));
}, []);
```

**問題点:**
- ローディング、エラー、データの3つの状態を手動管理
- キャッシュがない（ページ遷移のたびに再取得）
- 複数コンポーネントでの状態共有が難しい
- 再試行、ポーリングなどの機能を自前実装

### 解決策

React Queryは**サーバー状態管理ライブラリ**。データ取得、キャッシュ、同期を自動化する。

```tsx
// ✅ React Queryを使用（シンプル）
const { data: users, isLoading, error } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
});
```

### サーバー状態 vs クライアント状態

| 種類 | 説明 | 例 | 管理方法 |
|------|------|-----|---------|
| サーバー状態 | サーバーに存在するデータ | ユーザー一覧、投稿記事 | **React Query** |
| クライアント状態 | クライアントのみで存在 | モーダル開閉、テーマ | Zustand, useState |

> **ポイント:** サーバー状態とクライアント状態を別のツールで管理することで、それぞれに最適化された機能を活用できる。

### 他の選択肢との比較

| ライブラリ | 特徴 | React対応 | 採用理由 |
|-----------|------|----------|---------|
| **React Query v4** | キャッシュ、再試行、自動再取得 | React 17対応 | プロジェクトで使用予定 |
| SWR | Vercel製、シンプル | React 17対応 | 機能がReact Queryより少ない |
| Redux Toolkit Query | RTKに統合 | React 17対応 | 単独使用には設定が多い |
| Apollo Client | GraphQL向け | React 17対応 | REST APIには不向き |

---

## 実装手順

### 3-1. QueryClientProvider設定

#### 背景・目的
React Query を使うには、アプリ全体を `QueryClientProvider` でラップする必要がある。これにより、どのコンポーネントからもキャッシュにアクセスできる。

#### コード

**`src/index.tsx`** を修正（`QueryClientProvider` を追加）：

```tsx
import React from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

ReactDOM.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App />
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
```

#### コード解説

| 行 | コード | 説明 |
|----|--------|------|
| 5 | `QueryClient, QueryClientProvider` | React Queryのコア。キャッシュ管理とコンテキスト提供 |
| 16-23 | `new QueryClient({...})` | キャッシュとデフォルト動作の設定 |
| 18 | `queries: {...}` | `useQuery` のデフォルトオプション |
| 19 | `refetchOnWindowFocus: false` | タブ切り替え時の自動再取得を無効化 |
| 20 | `retry: 1` | 失敗時のリトライ回数（デフォルトは3） |
| 27 | `<QueryClientProvider>` | アプリ全体にQueryClientを提供 |

#### QueryClient オプションの詳細解説

| オプション | デフォルト値 | 設定値 | 理由 |
|------------|--------------|--------|------|
| `refetchOnWindowFocus` | `true` | `false` | 開発中のタブ切り替えで毎回リフェッチされるのを防ぐ |
| `retry` | `3` | `1` | json-serverは安定しているため、長いリトライは不要 |
| `staleTime` | `0` | - | データが「古い」と判断されるまでの時間（ms） |
| `cacheTime` | `300000` (5分) | - | 未使用キャッシュが保持される時間 |

#### プロバイダーの順序

```
React.StrictMode
  └── QueryClientProvider  ← 追加！最外側に近い位置
        └── BrowserRouter
              └── ThemeProvider
                    └── App
```

**なぜこの位置か？**
- `QueryClientProvider` はルーティングやテーマより先に必要なわけではない
- しかし、どのページコンポーネントからもキャッシュにアクセスするため、外側に置く
- `BrowserRouter` の外に置くことで、ルーティング関連の副作用でキャッシュが壊れない

---

### 3-2. カスタムフック

#### 背景・目的
React Query のフック（`useQuery`, `useMutation`）をラップしたカスタムフックを作成する。これにより、コンポーネントからはシンプルなインターフェースで使える。

#### コード

**`src/features/users/hooks/useUsers.ts`** を新規作成：

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUsers, fetchUser, createUser, updateUser, deleteUser } from '../../../api/users';
import { UserFormData } from '../types';

// クエリキー定数
const USERS_KEY = ['users'] as const;
const userKey = (id: number) => ['users', id] as const;

// ユーザー一覧を取得
export const useUsers = () => {
  return useQuery({
    queryKey: USERS_KEY,
    queryFn: fetchUsers,
  });
};

// ユーザー詳細を取得
export const useUser = (id: number) => {
  return useQuery({
    queryKey: userKey(id),
    queryFn: () => fetchUser(id),
    enabled: id > 0,
  });
};

// ユーザー作成
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: UserFormData) => createUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY });
    },
  });
};

// ユーザー更新
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UserFormData }) => updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY });
    },
  });
};

// ユーザー削除
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY });
    },
  });
};
```

#### コード解説

| 行 | コード | 説明 |
|----|--------|------|
| 1 | `useQuery, useMutation, useQueryClient` | React Queryの主要フック |
| 6 | `const USERS_KEY = ['users'] as const` | クエリキーを定数化。`as const`で型を厳密に |
| 7 | `userKey(id)` | 関数でキーを生成。`['users', 1]`のように動的キー |
| 11-14 | `useQuery({...})` | データ取得のクエリを定義 |
| 12 | `queryKey: USERS_KEY` | キャッシュのキー。同じキーなら同じキャッシュ |
| 13 | `queryFn: fetchUsers` | データを取得する関数 |
| 22 | `enabled: id > 0` | 条件を満たすまでクエリを実行しない |
| 28 | `useQueryClient()` | QueryClientインスタンスを取得 |
| 30-35 | `useMutation({...})` | データ変更のミューテーションを定義 |
| 31 | `mutationFn` | 実行する変更処理 |
| 32-34 | `onSuccess` | 成功時のコールバック |
| 33 | `invalidateQueries` | 指定キーのキャッシュを無効化→自動再取得 |

#### React Query のコア概念

```
┌─────────────────────────────────────────────────────────────┐
│                    QueryClient                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                    Cache                              │   │
│  │   ['users']        → [User, User, ...]               │   │
│  │   ['users', 1]     → User { id: 1, ... }             │   │
│  │   ['users', 2]     → User { id: 2, ... }             │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
         ↑                           ↓
    invalidate                  subscribe
         ↑                           ↓
┌─────────────┐  mutate   ┌─────────────┐
│ useMutation │ ────────→ │   Server    │
└─────────────┘           └─────────────┘
                               ↑
                            fetch
                               │
┌─────────────┐           ┌─────────────┐
│  useQuery   │ ←──────── │   Server    │
└─────────────┘  data     └─────────────┘
```

#### クエリキーの設計

| キー | 用途 | 説明 |
|------|------|------|
| `['users']` | 一覧 | 全ユーザーのキャッシュ |
| `['users', 1]` | 詳細 | ID=1のユーザーのキャッシュ |
| `['users', { status: 'active' }]` | フィルター | 条件付きのキャッシュ |

**キー設計のルール:**
- 配列で階層構造を表現
- 最初の要素は「リソース名」
- 後続の要素は「パラメータ」
- `invalidateQueries(['users'])` は `['users', 1]` も無効化（部分一致）

#### `enabled` オプションの活用

```ts
// 新規作成時（id がない）はフェッチしない
export const useUser = (id: number) => {
  return useQuery({
    queryKey: userKey(id),
    queryFn: () => fetchUser(id),
    enabled: id > 0,  // id が 0 以下なら実行しない
  });
};
```

**ユースケース:**
- フォームで新規作成 vs 編集を判断
- 依存するデータが揃うまで待機
- ユーザー操作を待ってからフェッチ

---

### 3-3. ユーザー一覧ページ（シンプル版）

#### 背景・目的
カスタムフックを使ってユーザー一覧を表示する。React Queryが提供する `isLoading`, `isError` を使って状態をハンドリングする。

#### コード

**`src/features/users/pages/UserListPage.tsx`** を新規作成：

```tsx
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import { useUsers } from '../hooks/useUsers';
import { Role } from '../types';

const roleLabels: Record<Role, { label: string; color: 'error' | 'warning' | 'info' }> = {
  admin: { label: '管理者', color: 'error' },
  editor: { label: '編集者', color: 'warning' },
  viewer: { label: '閲覧者', color: 'info' },
};

const UserListPage = () => {
  const { data: users, isLoading, isError, error } = useUsers();

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
      <Typography variant="h5" sx={{ mb: 3 }}>
        ユーザー一覧
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>名前</TableCell>
              <TableCell>メール</TableCell>
              <TableCell>権限</TableCell>
              <TableCell>部署</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    label={roleLabels[user.role].label}
                    color={roleLabels[user.role].color}
                    size="small"
                  />
                </TableCell>
                <TableCell>{user.department}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default UserListPage;
```

#### コード解説

| 行 | コード | 説明 |
|----|--------|------|
| 18-22 | `roleLabels` | ロールに応じたラベルと色のマッピング |
| 18 | `Record<Role, {...}>` | キーがRole型、値がオブジェクトの辞書型 |
| 25 | `useUsers()` | カスタムフックでデータ取得 |
| 25 | `data: users` | 分割代入でリネーム（`data`を`users`に） |
| 27-32 | `if (isLoading)` | 初回ロード中の表示 |
| 34-40 | `if (isError)` | エラー時の表示 |
| 60 | `users?.map` | オプショナルチェイニング。`users`が`undefined`でもエラーにならない |
| 65-69 | `<Chip>` | MUIのバッジコンポーネント |

#### useQuery の返り値

| プロパティ | 型 | 説明 |
|-----------|-----|------|
| `data` | `T ｜ undefined` | 取得したデータ |
| `isLoading` | `boolean` | 初回ロード中（キャッシュなし） |
| `isFetching` | `boolean` | フェッチ中（バックグラウンド含む） |
| `isError` | `boolean` | エラー発生 |
| `error` | `Error ｜ null` | エラーオブジェクト |
| `isSuccess` | `boolean` | 成功（データあり） |
| `refetch` | `() => void` | 手動で再取得 |

#### `isLoading` vs `isFetching`

```
初回アクセス:
isLoading: true  → データ取得中
isFetching: true → データ取得中

キャッシュあり + バックグラウンド更新:
isLoading: false → キャッシュがあるので false
isFetching: true → 裏でフェッチ中

キャッシュあり + フェッチなし:
isLoading: false
isFetching: false
```

---

### 3-4. App.tsxの更新

#### 背景・目的
仮のコンポーネントを本物の `UserListPage` に差し替える。

#### コード

**`src/App.tsx`** を更新：

```tsx
import { Route, Switch } from 'react-router-dom';
import Layout from './components/Layout';
import UserListPage from './features/users/pages/UserListPage';

// UserFormPageは Step 5 で実装
const UserFormPage = () => <h2>ユーザー登録ページ（Step 5で実装）</h2>;

function App() {
  return (
    <Layout>
      <Switch>
        <Route exact path="/" component={UserListPage} />
        <Route exact path="/users/new" component={UserFormPage} />
        <Route exact path="/users/:id/edit" component={UserFormPage} />
      </Switch>
    </Layout>
  );
}

export default App;
```

---

## 動作確認

ターミナル2つでそれぞれ起動：
```bash
# ターミナル1
npm run server

# ターミナル2
npm start
```

**確認項目:**
- [ ] ユーザー一覧がテーブルで表示される
- [ ] ローディング中にスピナーが表示される
- [ ] json-serverを停止するとエラーメッセージが表示される
- [ ] ブラウザのDevTools → Network タブで `GET /users` リクエストを確認
- [ ] 再度ページにアクセスした時、すぐにデータが表示される（キャッシュ）

---

## よくある質問・トラブルシューティング

### Q: `useQuery` の `queryFn` でエラーが出る

**A:** `queryFn` はPromiseを返す関数である必要がある。非同期関数を直接渡す：
```ts
// ✅ 正しい
queryFn: fetchUsers

// ✅ 正しい（引数が必要な場合）
queryFn: () => fetchUser(id)

// ❌ 間違い（関数の戻り値を渡している）
queryFn: fetchUsers()
```

### Q: データが更新されない

**A:** `invalidateQueries` でキャッシュを無効化しているか確認：
```ts
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: USERS_KEY });
}
```

### Q: 型エラー `Property 'xxx' does not exist on type 'unknown'`

**A:** `error` のデフォルト型は `unknown`。明示的にキャスト：
```tsx
{(error as Error).message}
```

または、型ガードを使用：
```tsx
{error instanceof Error && error.message}
```

### Q: `Cannot find module '@tanstack/react-query'`

**A:** パッケージがインストールされていない：
```bash
npm install @tanstack/react-query@4
```

---

## まとめ

このステップで学んだこと：

1. **サーバー状態 vs クライアント状態**
   - サーバー状態（API データ）→ React Query
   - クライアント状態（UI状態）→ Zustand / useState

2. **useQuery**
   - `queryKey` でキャッシュを識別
   - `queryFn` でデータを取得
   - `isLoading`, `isError`, `data` で状態管理

3. **useMutation**
   - データ変更処理に使用
   - `onSuccess` で成功後の処理
   - `invalidateQueries` でキャッシュを無効化

4. **キャッシュの仕組み**
   - 同じキーならキャッシュを共有
   - `invalidateQueries` で再取得をトリガー
   - `staleTime`, `cacheTime` で挙動をカスタマイズ

5. **カスタムフック化**
   - `useQuery` / `useMutation` をラップ
   - コンポーネントをシンプルに保つ

---

**次のステップ:** [Step 4: TanStack Table](./step-4-tanstack-table.md)
