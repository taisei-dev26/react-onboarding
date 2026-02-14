# ユーザー管理システム 実装手順書

## 概要

来月から参加するプロジェクトの技術スタックを事前学習するため、**ユーザー管理システム**を段階的に構築する。各ステップで1つの技術にフォーカスし、理解を深めながら進める。

## 技術スタック

| カテゴリ | ライブラリ | バージョン |
|---------|-----------|-----------|
| UI Framework | React | ^17.0.2 |
| Language | TypeScript | ^4.9.5 |
| UI Components | @mui/material | v5 |
| Routing | react-router-dom | v5 |
| State Management | zustand | v4 |
| Form | react-hook-form | v7 |
| Validation | yup + @hookform/resolvers | - |
| Data Fetching | @tanstack/react-query | v4 |
| HTTP Client | axios | - |
| Table | @tanstack/react-table | v8 |
| Mock API | json-server | v0 |

> **React 17互換性メモ:** MUI v5、React Query v4、React Router v5 は React 17 をサポートする最後のメジャーバージョン。v6以降はReact 18が必須。

## ディレクトリ構成（features設計）

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

> **features設計とは:** 機能（feature）単位でディレクトリを切る設計パターン。`features/users/` にユーザー機能のコンポーネント・フック・型・バリデーションをすべて配置する。共通で使うものだけ `src/components/` や `src/api/` に置く。

---

## Step 1: 環境構築 + Material UI基盤

**学ぶこと:** MUI v5のセットアップ、テーマ設定、基本レイアウト、React Router v5

### 1-1. パッケージインストール

```bash
npm install \
  @mui/material@5 @mui/icons-material@5 @emotion/react @emotion/styled \
  react-router-dom@5 @types/react-router-dom@5 \
  zustand@4 \
  react-hook-form @hookform/resolvers yup \
  @tanstack/react-query@4 axios \
  @tanstack/react-table@8 \
  json-server@0
```

> **なぜ `@emotion/react` と `@emotion/styled` が必要？**
> MUI v5はスタイリングエンジンとしてEmotionを採用している。この2つはMUIのピア依存であり、インストールしないとMUIコンポーネントが正しく動作しない。

### 1-2. 不要ファイルの削除

CRAのデフォルトファイルで不要なものを削除する：

```bash
rm src/App.css src/logo.svg src/reportWebVitals.ts src/setupTests.ts src/App.test.tsx
```

### 1-3. エントリポイント修正

**`src/index.tsx`**

```tsx
import React from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
  },
});

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);
```

> **プロバイダーの入れ子順序:**
> `BrowserRouter`（最外）→ `ThemeProvider` → `CssBaseline` → `App`
> ルーティングはアプリ全体で使うので最外側。`CssBaseline` はブラウザ間のCSS差異をリセットする（normalize.cssのMUI版）。

### 1-4. 共通Layoutコンポーネント

**`src/components/Layout.tsx`** を新規作成：

```tsx
import { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const DRAWER_WIDTH = 240;

const menuItems = [
  { text: 'ユーザー一覧', icon: <PeopleIcon />, path: '/' },
  { text: 'ユーザー登録', icon: <PersonAddIcon />, path: '/users/new' },
];

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const history = useHistory();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    history.push(path);
    setDrawerOpen(false);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(!drawerOpen)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            ユーザー管理システム
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          width: DRAWER_WIDTH,
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH },
        }}
      >
        <Toolbar />
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
```

> **React Router v5 ナビゲーション:**
> - `useHistory()` → `history.push(path)` でプログラム的にページ遷移（v6では `useNavigate()` → `navigate(path)`）
> - `useLocation()` → `location.pathname` で現在のURLパスを取得
> - `<ListItem button selected={...}>` → クリック可能で、現在のページならハイライト表示

### 1-5. ルーティング設定

**`src/App.tsx`**

```tsx
import { Route, Switch } from 'react-router-dom';
import Layout from './components/Layout';

// 仮のページコンポーネント（後のステップで本物に差し替え）
const UserListPage = () => <h2>ユーザー一覧ページ（Step 3で実装）</h2>;
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

> **React Router v5 の `Switch`:**
> - `<Switch>` は上から順にマッチした**最初のRoute**だけをレンダリング
> - `exact` を付けないと `/users/new` が `/` にもマッチしてしまう
> - `/users/:id/edit` の `:id` はURLパラメータ。コンポーネント内で `useParams()` を使って取得可能

### 1-6. 動作確認

```bash
npm start
```

**確認項目:**
- [ ] AppBarに「ユーザー管理システム」が表示される
- [ ] ハンバーガーメニュークリックでDrawerが開く
- [ ] メニュー選択で画面が切り替わる
- [ ] URLが `/` と `/users/new` で変わる

---

## Step 2: json-server + Axios + 型定義

**学ぶこと:** REST API設計、Axiosインスタンスの作成、TypeScriptの型定義

### 2-1. モックデータ作成

**プロジェクトルートに `db.json`** を作成：

```json
{
  "users": [
    {
      "id": 1,
      "name": "田中太郎",
      "email": "tanaka@example.com",
      "role": "admin",
      "department": "開発部",
      "createdAt": "2025-01-15T09:00:00Z"
    },
    {
      "id": 2,
      "name": "佐藤花子",
      "email": "sato@example.com",
      "role": "editor",
      "department": "マーケティング部",
      "createdAt": "2025-02-20T10:30:00Z"
    },
    {
      "id": 3,
      "name": "鈴木一郎",
      "email": "suzuki@example.com",
      "role": "viewer",
      "department": "営業部",
      "createdAt": "2025-03-10T14:00:00Z"
    },
    {
      "id": 4,
      "name": "高橋美咲",
      "email": "takahashi@example.com",
      "role": "editor",
      "department": "開発部",
      "createdAt": "2025-04-05T11:15:00Z"
    },
    {
      "id": 5,
      "name": "伊藤健太",
      "email": "ito@example.com",
      "role": "viewer",
      "department": "人事部",
      "createdAt": "2025-05-12T08:45:00Z"
    }
  ]
}
```

### 2-2. json-serverの起動スクリプト

**`package.json`** の `scripts` に追加：

```json
{
  "scripts": {
    "start": "react-scripts start",
    "server": "json-server --watch db.json --port 3001",
    "dev": "concurrently \"npm start\" \"npm run server\"",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}
```

> `concurrently` を使うと フロントエンド（port 3000）とAPIサーバー（port 3001）を同時起動できる。
> インストール: `npm install -D concurrently`
> もしくは、ターミナルを2つ開いて `npm start` と `npm run server` を別々に実行してもOK。

### 2-3. 型定義

**`src/features/users/types/index.ts`** を新規作成：

```ts
export type Role = 'admin' | 'editor' | 'viewer';

export type User = {
  id: number;
  name: string;
  email: string;
  role: Role;
  department: string;
  createdAt: string;
};

// 作成・更新時はidとcreatedAtを含めない
export type UserFormData = Omit<User, 'id' | 'createdAt'>;
```

> **`Omit<T, K>` ユーティリティ型:**
> `User` 型から `id` と `createdAt` を除いた型を作成。フォームデータではサーバー側で自動生成されるフィールドは不要なため。

### 2-4. Axiosインスタンス

**`src/api/client.ts`** を新規作成：

```ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// レスポンスインターセプター（エラーログ用）
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.status, error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
```

> **Axiosインスタンスのメリット:**
> - `baseURL` を一箇所で設定（環境ごとの切り替えが容易）
> - `interceptors` で共通のリクエスト/レスポンス処理（認証トークン付与、エラーログ等）
> - 実プロジェクトでは認証ヘッダーの付与に `request` インターセプターを使う

### 2-5. ユーザーAPI関数

**`src/api/users.ts`** を新規作成：

```ts
import apiClient from './client';
import { User, UserFormData } from '../features/users/types';

// ユーザー一覧取得
export const fetchUsers = async (): Promise<User[]> => {
  const { data } = await apiClient.get<User[]>('/users');
  return data;
};

// ユーザー詳細取得
export const fetchUser = async (id: number): Promise<User> => {
  const { data } = await apiClient.get<User>(`/users/${id}`);
  return data;
};

// ユーザー作成
export const createUser = async (userData: UserFormData): Promise<User> => {
  const { data } = await apiClient.post<User>('/users', {
    ...userData,
    createdAt: new Date().toISOString(),
  });
  return data;
};

// ユーザー更新
export const updateUser = async (id: number, userData: UserFormData): Promise<User> => {
  const { data } = await apiClient.put<User>(`/users/${id}`, {
    ...userData,
  });
  return data;
};

// ユーザー削除
export const deleteUser = async (id: number): Promise<void> => {
  await apiClient.delete(`/users/${id}`);
};
```

> **API関数を分離する理由:**
> コンポーネントから直接 `axios.get(...)` を呼ぶのではなく、API関数としてまとめる。
> これにより、エンドポイントの変更が1箇所で済み、React Queryのフックからも呼びやすくなる。

### 2-6. 動作確認

ターミナル1で json-server を起動：
```bash
npm run server
```

ターミナル2で curl でAPIを確認：
```bash
curl http://localhost:3001/users
curl http://localhost:3001/users/1
```

**確認項目:**
- [ ] `http://localhost:3001/users` でユーザー一覧のJSONが返る
- [ ] `http://localhost:3001/users/1` で田中太郎のデータが返る

---

## Step 3: React Query + ユーザー一覧

**学ぶこと:** QueryClient設定、useQuery、カスタムフック、キャッシュの仕組み

### 3-1. QueryClientProvider設定

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
      refetchOnWindowFocus: false, // ウィンドウフォーカス時の再取得を無効化
      retry: 1,                    // リトライ回数
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

> **QueryClientのデフォルトオプション:**
> - `refetchOnWindowFocus: false` → 開発中にタブ切り替えで毎回リフェッチされるのを防ぐ
> - `retry: 1` → API失敗時のリトライ回数（デフォルトは3回）
> - `QueryClientProvider` は `BrowserRouter` より外側に配置。どのページからもキャッシュにアクセスできるように

### 3-2. カスタムフック

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
    enabled: id > 0, // idが有効な場合のみ実行
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

> **React Queryの核心概念:**
> - **queryKey**: キャッシュのキー。`['users']` は一覧、`['users', 1]` はID=1の詳細。キーが異なれば別のキャッシュ
> - **useQuery**: データ取得（GET）。自動的にローディング・エラー・成功の状態を管理
> - **useMutation**: データ変更（POST/PUT/DELETE）。成功後に `invalidateQueries` でキャッシュを無効化→自動再取得
> - **enabled**: `false` の場合クエリを実行しない。新規作成時（`id` がない場合）にフェッチを防ぐ

### 3-3. ユーザー一覧ページ（シンプル版）

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

> **useQueryの返り値:**
> - `data`: 取得したデータ（初期は `undefined`）
> - `isLoading`: 初回読み込み中（キャッシュなし）
> - `isError`: エラー発生
> - `error`: エラーオブジェクト
> - React Queryが状態管理を担うため、`useState` + `useEffect` でローディング管理するコードが不要になる

### 3-4. App.tsxの更新

**`src/App.tsx`** の仮コンポーネントを本物に差し替え：

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

### 3-5. 動作確認

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

---

## Step 4: TanStack Table

**学ぶこと:** ヘッドレスUIの概念、カラム定義、ソート・フィルタ・ページネーション

### 4-1. UserTableコンポーネント

**`src/features/users/components/UserTable.tsx`** を新規作成：

```tsx
import { useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  TablePagination,
  TableSortLabel,
  Chip,
  IconButton,
  Box,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { User, Role } from '../types';

const roleLabels: Record<Role, { label: string; color: 'error' | 'warning' | 'info' }> = {
  admin: { label: '管理者', color: 'error' },
  editor: { label: '編集者', color: 'warning' },
  viewer: { label: '閲覧者', color: 'info' },
};

const columnHelper = createColumnHelper<User>();

type UserTableProps = {
  users: User[];
  onDelete: (id: number) => void;
};

const UserTable = ({ users, onDelete }: UserTableProps) => {
  const history = useHistory();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: '名前',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('email', {
        header: 'メール',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('role', {
        header: '権限',
        cell: (info) => {
          const role = info.getValue();
          return (
            <Chip
              label={roleLabels[role].label}
              color={roleLabels[role].color}
              size="small"
            />
          );
        },
      }),
      columnHelper.accessor('department', {
        header: '部署',
        cell: (info) => info.getValue(),
      }),
      columnHelper.display({
        id: 'actions',
        header: '操作',
        cell: (info) => (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              size="small"
              color="primary"
              onClick={() => history.push(`/users/${info.row.original.id}/edit`)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => onDelete(info.row.original.id)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ),
      }),
    ],
    [history, onDelete]
  );

  const table = useReactTable({
    data: users,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  });

  return (
    <>
      <TextField
        label="検索"
        variant="outlined"
        size="small"
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        sx={{ mb: 2, width: 300 }}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell key={header.id}>
                    {header.column.getCanSort() ? (
                      <TableSortLabel
                        active={!!header.column.getIsSorted()}
                        direction={header.column.getIsSorted() || undefined}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </TableSortLabel>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} hover>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={table.getFilteredRowModel().rows.length}
        page={table.getState().pagination.pageIndex}
        rowsPerPage={table.getState().pagination.pageSize}
        onPageChange={(_, page) => table.setPageIndex(page)}
        onRowsPerPageChange={(e) => table.setPageSize(Number(e.target.value))}
        rowsPerPageOptions={[5, 10, 25]}
        labelRowsPerPage="表示件数:"
      />
    </>
  );
};

export default UserTable;
```

> **TanStack Table の「ヘッドレスUI」とは:**
> TanStack Table はUIを持たない（headless）。テーブルの**ロジック**（ソート、フィルタ、ページネーション）だけを提供し、**見た目**は自分で組む。
> ここではMUIの `<Table>` を使ってレンダリングしているが、同じロジックで Ant Design や独自CSSのテーブルにも差し替えられる。
>
> **`columnHelper.accessor` vs `columnHelper.display`:**
> - `accessor`: データのフィールドに紐づくカラム（ソート・フィルタ可能）
> - `display`: データに紐づかない表示専用カラム（操作ボタン等）

### 4-2. UserListPageの更新

**`src/features/users/pages/UserListPage.tsx`** を更新：

```tsx
import { useHistory } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useUsers, useDeleteUser } from '../hooks/useUsers';
import UserTable from '../components/UserTable';

const UserListPage = () => {
  const history = useHistory();
  const { data: users, isLoading, isError, error } = useUsers();
  const deleteUserMutation = useDeleteUser();

  const handleDelete = (id: number) => {
    if (window.confirm('このユーザーを削除しますか？')) {
      deleteUserMutation.mutate(id);
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
    </Box>
  );
};

export default UserListPage;
```

### 4-3. 動作確認

**確認項目:**
- [ ] テーブルにユーザーデータが表示される
- [ ] カラムヘッダークリックでソートできる（昇順→降順→なし）
- [ ] 検索ボックスに文字を入力するとフィルタされる
- [ ] ページネーションが動作する
- [ ] 編集ボタンで `/users/:id/edit` に遷移する
- [ ] 削除ボタンで確認ダイアログ → 削除実行

---

## Step 5: React Hook Form + Yup（フォーム）

**学ぶこと:** useForm、Controller（MUI連携）、Yupバリデーションスキーマ、useMutation

### 5-1. Yupバリデーションスキーマ

**`src/features/users/validation/userSchema.ts`** を新規作成：

```ts
import * as yup from 'yup';

export const userSchema = yup.object({
  name: yup
    .string()
    .required('名前は必須です')
    .max(50, '名前は50文字以内で入力してください'),
  email: yup
    .string()
    .required('メールアドレスは必須です')
    .email('メールアドレスの形式が正しくありません'),
  role: yup
    .string()
    .required('権限は必須です')
    .oneOf(['admin', 'editor', 'viewer'], '無効な権限です'),
  department: yup
    .string()
    .required('部署は必須です')
    .max(50, '部署名は50文字以内で入力してください'),
});
```

> **Yupのメソッドチェーン:**
> `yup.string()` → 文字列型 → `.required()` → 必須 → `.email()` → メール形式チェック
> バリデーションルールを宣言的に定義できるのがYupの強み。
> `oneOf` は列挙値バリデーション。`Role` 型と対応させることで型安全にできる。

### 5-2. UserFormコンポーネント

**`src/features/users/components/UserForm.tsx`** を新規作成：

```tsx
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Box,
  Button,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import { UserFormData } from '../types';
import { userSchema } from '../validation/userSchema';

const roles = [
  { value: 'admin', label: '管理者' },
  { value: 'editor', label: '編集者' },
  { value: 'viewer', label: '閲覧者' },
];

const departments = ['開発部', 'マーケティング部', '営業部', '人事部', '総務部'];

type UserFormProps = {
  defaultValues?: UserFormData;
  onSubmit: (data: UserFormData) => void;
  isSubmitting: boolean;
};

const UserForm = ({ defaultValues, onSubmit, isSubmitting }: UserFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: yupResolver(userSchema),
    defaultValues: defaultValues ?? {
      name: '',
      email: '',
      role: 'viewer',
      department: '',
    },
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={3} sx={{ maxWidth: 500 }}>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="名前"
              error={!!errors.name}
              helperText={errors.name?.message}
              fullWidth
            />
          )}
        />

        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="メールアドレス"
              type="email"
              error={!!errors.email}
              helperText={errors.email?.message}
              fullWidth
            />
          )}
        />

        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              select
              label="権限"
              error={!!errors.role}
              helperText={errors.role?.message}
              fullWidth
            >
              {roles.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

        <Controller
          name="department"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              select
              label="部署"
              error={!!errors.department}
              helperText={errors.department?.message}
              fullWidth
            >
              {departments.map((dept) => (
                <MenuItem key={dept} value={dept}>
                  {dept}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={isSubmitting}
        >
          {isSubmitting ? '保存中...' : '保存'}
        </Button>
      </Stack>
    </Box>
  );
};

export default UserForm;
```

> **React Hook Form + MUI で `Controller` が必要な理由:**
> MUI の `TextField` は内部で独自の状態管理をしている（制御コンポーネント）。
> React Hook Form はデフォルトで非制御コンポーネント（`register`）を使うが、MUI との連携には `Controller` で制御コンポーネントとして統合する。
> `Controller` は `field` オブジェクト（`value`, `onChange`, `onBlur`, `ref`）を提供し、MUIコンポーネントに渡す。
>
> **`yupResolver` の役割:**
> React Hook Form とYupを橋渡しするアダプター。`useForm` の `resolver` に渡すことで、フォーム送信時にYupスキーマでバリデーションが実行される。

### 5-3. UserFormPage

**`src/features/users/pages/UserFormPage.tsx`** を新規作成：

```tsx
import { useHistory, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import UserForm from '../components/UserForm';
import { useUser, useCreateUser, useUpdateUser } from '../hooks/useUsers';
import { UserFormData } from '../types';

const UserFormPage = () => {
  const history = useHistory();
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;
  const userId = Number(id);

  const { data: user, isLoading } = useUser(userId);
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();

  const handleSubmit = (data: UserFormData) => {
    if (isEdit) {
      updateMutation.mutate(
        { id: userId, data },
        { onSuccess: () => history.push('/') }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => history.push('/'),
      });
    }
  };

  if (isEdit && isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const defaultValues: UserFormData | undefined = user
    ? { name: user.name, email: user.email, role: user.role, department: user.department }
    : undefined;

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>
        {isEdit ? 'ユーザー編集' : 'ユーザー登録'}
      </Typography>

      {(createMutation.isError || updateMutation.isError) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          保存に失敗しました。もう一度お試しください。
        </Alert>
      )}

      <UserForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isLoading || updateMutation.isLoading}
      />
    </Box>
  );
};

export default UserFormPage;
```

> **新規作成と編集の共存パターン:**
> `useParams()` で `:id` を取得。`id` があれば編集モード、なければ新規作成モード。
> 同じフォームコンポーネントを `defaultValues` の有無で使い分ける。
> `useMutation` の `onSuccess` コールバックで成功後に一覧画面へ遷移。

### 5-4. App.tsxの更新

**`src/App.tsx`** を最終更新：

```tsx
import { Route, Switch } from 'react-router-dom';
import Layout from './components/Layout';
import UserListPage from './features/users/pages/UserListPage';
import UserFormPage from './features/users/pages/UserFormPage';

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

### 5-5. 動作確認

**確認項目:**
- [ ] 「ユーザー登録」ページでフォームが表示される
- [ ] 空欄で送信するとバリデーションエラーが表示される
- [ ] 正しく入力して送信すると一覧に戻り、新しいユーザーが追加されている
- [ ] 一覧の編集ボタンから編集画面に遷移し、既存データがフォームに入っている
- [ ] 編集して保存すると一覧に反映される

---

## Step 6: Zustand（グローバル状態管理）

**学ぶこと:** ストアの作成、セレクタ、コンポーネント間の状態共有

### 6-1. Appストア

**`src/stores/useAppStore.ts`** を新規作成：

```ts
import create from 'zustand';

type Notification = {
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
};

type AppState = {
  // 通知（Snackbar）
  notification: Notification | null;
  showNotification: (notification: Notification) => void;
  clearNotification: () => void;

  // サイドバー
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
};

export const useAppStore = create<AppState>((set) => ({
  // 通知
  notification: null,
  showNotification: (notification) => set({ notification }),
  clearNotification: () => set({ notification: null }),

  // サイドバー
  sidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
```

> **Zustand の特徴:**
> - Redux と違い、**ボイラープレートが極めて少ない**（Provider不要、action type不要）
> - `create` 関数にストアの型と初期値を渡すだけでストアが完成
> - `set` 関数で状態を更新。`set((state) => ({...}))` で前の状態を参照可能
> - フックとして使う: `const notification = useAppStore((state) => state.notification)`
> - セレクタ（`(state) => state.notification`）で必要な値だけ購読 → 不要な再レンダリングを防止

### 6-2. 通知（Snackbar）コンポーネント

**`src/components/NotificationSnackbar.tsx`** を新規作成：

```tsx
import { Snackbar, Alert } from '@mui/material';
import { useAppStore } from '../stores/useAppStore';

const NotificationSnackbar = () => {
  const notification = useAppStore((state) => state.notification);
  const clearNotification = useAppStore((state) => state.clearNotification);

  return (
    <Snackbar
      open={!!notification}
      autoHideDuration={4000}
      onClose={clearNotification}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      {notification ? (
        <Alert
          onClose={clearNotification}
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      ) : undefined}
    </Snackbar>
  );
};

export default NotificationSnackbar;
```

### 6-3. Layoutにサイドバー状態を統合

**`src/components/Layout.tsx`** のサイドバー状態をZustandに移行：

```tsx
// 変更前
const [drawerOpen, setDrawerOpen] = useState(false);

// 変更後
import { useAppStore } from '../stores/useAppStore';

const sidebarOpen = useAppStore((state) => state.sidebarOpen);
const toggleSidebar = useAppStore((state) => state.toggleSidebar);
const setSidebarOpen = useAppStore((state) => state.setSidebarOpen);
```

`drawerOpen` → `sidebarOpen`、`setDrawerOpen(false)` → `setSidebarOpen(false)` に置き換える。

### 6-4. App.tsxに通知コンポーネント追加

**`src/App.tsx`** に `NotificationSnackbar` を追加：

```tsx
import { Route, Switch } from 'react-router-dom';
import Layout from './components/Layout';
import UserListPage from './features/users/pages/UserListPage';
import UserFormPage from './features/users/pages/UserFormPage';
import NotificationSnackbar from './components/NotificationSnackbar';

function App() {
  return (
    <Layout>
      <Switch>
        <Route exact path="/" component={UserListPage} />
        <Route exact path="/users/new" component={UserFormPage} />
        <Route exact path="/users/:id/edit" component={UserFormPage} />
      </Switch>
      <NotificationSnackbar />
    </Layout>
  );
}

export default App;
```

### 6-5. フックで通知を使う

**`src/features/users/hooks/useUsers.ts`** の各 mutation の `onSuccess` に通知を追加：

```ts
import { useAppStore } from '../../../stores/useAppStore';

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  const showNotification = useAppStore.getState().showNotification;

  return useMutation({
    mutationFn: (userData: UserFormData) => createUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY });
      showNotification({ message: 'ユーザーを作成しました', severity: 'success' });
    },
    onError: () => {
      showNotification({ message: 'ユーザーの作成に失敗しました', severity: 'error' });
    },
  });
};
```

> **`useAppStore.getState()` vs `useAppStore((s) => s.xxx)`:**
> - `useAppStore((s) => s.xxx)` はフック（コンポーネント内で使い、再レンダリングを発生させる）
> - `useAppStore.getState()` はストアの現在値を直接取得（コールバック内で使う。再レンダリングを起こさない）
> - mutation の `onSuccess` はイベントハンドラなので `getState()` が適切

同様に `useUpdateUser` と `useDeleteUser` にも通知を追加する。

### 6-6. 動作確認

**確認項目:**
- [ ] ユーザー作成後に「ユーザーを作成しました」の通知が右下に表示される
- [ ] 4秒後に通知が自動で消える
- [ ] 編集・削除後も通知が表示される
- [ ] サイドバーの開閉がZustandで管理されている

---

## Step 7: 仕上げ

**学ぶこと:** 確認ダイアログ、エラーハンドリング、UI改善

### 7-1. 削除確認ダイアログ

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

### 7-2. UserListPageの削除処理を改善

`window.confirm` をダイアログに差し替える：

```tsx
import { useState } from 'react';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';

const UserListPage = () => {
  // ...既存のコード
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);

  const handleDelete = (id: number) => {
    const user = users?.find((u) => u.id === id);
    if (user) {
      setDeleteTarget({ id: user.id, name: user.name });
    }
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteUserMutation.mutate(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <Box>
      {/* ...既存のコード */}
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
```

### 7-3. 動作確認（最終）

**全体の確認項目:**
- [ ] ユーザー一覧が表示される（TanStack Table）
- [ ] ソート・フィルタ・ページネーションが動作する
- [ ] 「ユーザー登録」で新規ユーザーを作成できる
- [ ] バリデーションエラーが正しく表示される
- [ ] 編集ボタンで既存データがフォームに入り、更新できる
- [ ] 削除ボタンで確認ダイアログが表示され、削除できる
- [ ] 各操作後に通知（Snackbar）が表示される
- [ ] サイドバーでページ遷移できる

---

## 完成後の学習ポイント

各技術の理解度を確認するために、以下の問いに答えられるか試してみてください：

1. **React Query**: `useQuery` と `useMutation` の違いは？`invalidateQueries` は何をしている？
2. **TanStack Table**: ヘッドレスUIのメリットは？`columnHelper.accessor` と `columnHelper.display` の違いは？
3. **React Hook Form**: なぜMUIとの連携に `Controller` が必要？`register` との違いは？
4. **Yup**: `resolver` パターンのメリットは？バリデーションをコンポーネントの外に出す理由は？
5. **Zustand**: Redux と比べてどこがシンプル？`getState()` とセレクタの使い分けは？
6. **Axios**: インスタンスを作るメリットは？`interceptors` はどんな場面で使う？
7. **features設計**: なぜ機能単位でディレクトリを分ける？共通コンポーネントとの境界は？
