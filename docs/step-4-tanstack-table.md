# Step 4: TanStack Table

## このステップで学ぶこと

- ヘッドレスUI（Headless UI）の概念
- TanStack Table のカラム定義
- ソート、フィルタ、ページネーションの実装
- MUI テーブルとの統合

---

## なぜTanStack Tableを使うのか

### 課題

テーブルにソート・フィルタ・ページネーション機能を追加すると、ロジックが複雑になる：

```tsx
// ❌ 自前実装（複雑）
const [sortField, setSortField] = useState<string | null>(null);
const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
const [filter, setFilter] = useState('');
const [page, setPage] = useState(0);
const [pageSize, setPageSize] = useState(10);

const sortedUsers = useMemo(() => {
  if (!sortField) return users;
  return [...users].sort((a, b) => {
    // ソートロジック...
  });
}, [users, sortField, sortOrder]);

const filteredUsers = useMemo(() => {
  // フィルタロジック...
}, [sortedUsers, filter]);

const paginatedUsers = useMemo(() => {
  // ページネーションロジック...
}, [filteredUsers, page, pageSize]);
```

**問題点:**
- 状態管理が複雑
- ソート・フィルタ・ページネーションの組み合わせが難しい
- テストが困難
- カラム追加のたびに修正が必要

### 解決策

TanStack Table は**ヘッドレスUI**ライブラリ。テーブルの**ロジック**だけを提供し、**見た目**は自分で組む。

```tsx
// ✅ TanStack Table（ロジックを委譲）
const table = useReactTable({
  data: users,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
});
```

### ヘッドレスUIとは

```
┌───────────────────────────────────────────────────────┐
│                 従来のUIライブラリ                      │
│  ┌──────────────────┐  ┌──────────────────┐           │
│  │     ロジック      │  │      見た目       │           │
│  │  ソート、フィルタ   │  │  CSS、コンポーネント │           │
│  └──────────────────┘  └──────────────────┘           │
│           ↓                     ↓                     │
│           └────── 密結合 ───────┘                     │
│                      ↓                                │
│              カスタマイズが難しい                        │
└───────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────┐
│                  ヘッドレスUI                          │
│  ┌──────────────────┐                                │
│  │ TanStack Table   │  ← ロジックのみ提供              │
│  │ ソート、フィルタ   │                                │
│  └────────┬─────────┘                                │
│           ↓ API                                      │
│  ┌──────────────────┐                                │
│  │   MUI Table      │  ← 自分で選んだUIライブラリ       │
│  │  または任意のUI   │                                │
│  └──────────────────┘                                │
│              ↓                                       │
│        自由にカスタマイズ可能                           │
└───────────────────────────────────────────────────────┘
```

### 他の選択肢との比較

| ライブラリ | 種類 | 見た目 | カスタマイズ性 | 採用理由 |
|-----------|------|--------|--------------|---------|
| **TanStack Table** | ヘッドレス | 自分で組む | 非常に高い | ロジックとUIを分離できる |
| MUI DataGrid | 統合型 | MUI固定 | 中程度 | ライセンス(MIT/商用)の確認必要 |
| AG Grid | 統合型 | 独自 | 高い | 高機能だが商用ライセンス |
| react-table v7 | ヘッドレス | 自分で組む | 高い | v8（TanStack Table）に移行済み |

---

## 実装手順

### 4-1. UserTableコンポーネント

#### 背景・目的
TanStack Tableを使ってユーザー一覧テーブルを作成する。ソート・フィルタ・ページネーション機能を持ち、編集・削除ボタンも配置する。

#### コード

**`src/features/users/components/UserTable.tsx`** を新規作成：

```tsx
import { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
  RowData,
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

// TanStack Table の meta を型付け
declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    onEdit?: (id: number) => void;
    onDelete?: (id: number) => void;
  }
}

const roleLabels: Record<Role, { label: string; color: 'error' | 'warning' | 'info' }> = {
  admin: { label: '管理者', color: 'error' },
  editor: { label: '編集者', color: 'warning' },
  viewer: { label: '閲覧者', color: 'info' },
};

const columnHelper = createColumnHelper<User>();

// カラム定義はコンポーネント外に配置（安定した参照）
const columns = [
  columnHelper.accessor('name', {
    header: '名前',
    // cell は省略可能（デフォルトで getValue() が呼ばれる）
  }),
  columnHelper.accessor('email', {
    header: 'メール',
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
  }),
  columnHelper.display({
    id: 'actions',
    header: '操作',
    cell: ({ row, table }) => {
      // meta からコールバックを取得
      const { onEdit, onDelete } = table.options.meta ?? {};
      return (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            size="small"
            color="primary"
            onClick={() => onEdit?.(row.original.id)}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => onDelete?.(row.original.id)}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      );
    },
  }),
];

type UserTableProps = {
  users: User[];
  onDelete: (id: number) => void;
  onEdit: (id: number) => void;
};

const UserTable = ({ users, onDelete, onEdit }: UserTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data: users,
    columns,  // 外部定義を直接参照（useMemo 不要）
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
    // meta でコールバックを渡す
    meta: {
      onEdit,
      onDelete,
    },
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

#### コード解説（import部分）

| コード | 説明 |
|--------|------|
| `useReactTable` | TanStack Tableのメインフック |
| `getCoreRowModel` | 基本の行モデル（必須） |
| `getSortedRowModel` | ソート機能を有効化 |
| `getFilteredRowModel` | フィルタ機能を有効化 |
| `getPaginationRowModel` | ページネーション機能を有効化 |
| `flexRender` | セル内容をレンダリングするヘルパー |
| `createColumnHelper` | 型安全なカラム定義ヘルパー |
| `SortingState` | ソート状態の型 |
| `RowData` | meta の型定義に必要 |

#### コード解説（meta 型定義）

```tsx
declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    onEdit?: (id: number) => void;
    onDelete?: (id: number) => void;
  }
}
```

TanStack Table の `meta` はデフォルトで `unknown` 型。TypeScript の Module Augmentation を使って型を拡張することで、`table.options.meta` に型安全にアクセスできる。

#### コード解説（カラム定義）

| コード | 説明 |
|--------|------|
| `createColumnHelper<User>()` | User型に基づくカラムヘルパーを作成 |
| `columnHelper.accessor('name', {...})` | データフィールドに紐づくカラム |
| `header: '名前'` | ヘッダーのラベル |
| `cell` 省略 | デフォルトで `getValue()` が呼ばれる |
| `accessor('role', {...})` | カスタムセル描画の例 |
| `columnHelper.display({...})` | データに紐づかない表示専用カラム |
| `id: 'actions'` | display列には明示的なIDが必要 |
| `table.options.meta` | テーブルに渡した meta オブジェクトを取得 |

#### なぜカラム定義をコンポーネント外に置くのか

```
┌─────────────────────────────────────────────────────────────┐
│  ❌ コンポーネント内で useMemo                                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ const columns = useMemo(() => [...], [history]);    │    │
│  └─────────────────────────────────────────────────────┘    │
│  → history が変わるたびにカラム配列が再生成される              │
│  → テーブル全体が不要に再レンダリングされる可能性              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  ✅ コンポーネント外 + meta パターン                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ const columns = [...];  // モジュールレベル           │    │
│  │ meta: { onEdit, onDelete }  // コールバックは meta へ  │    │
│  └─────────────────────────────────────────────────────┘    │
│  → カラム定義は常に同じ参照（安定）                          │
│  → コールバックの変化はカラム再生成を引き起こさない            │
└─────────────────────────────────────────────────────────────┘
```

#### `accessor` vs `display`

| 種類 | 用途 | ソート/フィルタ | 例 |
|------|------|----------------|-----|
| `accessor` | データフィールドを表示 | 可能 | name, email, role |
| `display` | 計算値やボタンを表示 | 不可 | 操作ボタン |

#### コード解説（テーブル設定）

| コード | 説明 |
|--------|------|
| `useReactTable({...})` | テーブルインスタンスを作成 |
| `data: users` | テーブルのデータソース |
| `columns` | カラム定義（外部定義を直接参照） |
| `state: {...}` | 管理する状態（ソート、フィルタ） |
| `onXxxChange` | 状態変更時のコールバック |
| `getXxxRowModel()` | 各機能のロジックを追加 |
| `meta: {...}` | カラムから参照するコールバック等を渡す |
| `initialState` | 初期状態（ページサイズなど） |

#### コード解説（レンダリング部分）

| 行 | コード | 説明 |
|----|--------|------|
| 122 | `table.getHeaderGroups()` | ヘッダー行のグループを取得 |
| 125 | `header.column.getCanSort()` | このカラムがソート可能か |
| 127 | `header.column.getIsSorted()` | 現在のソート方向（'asc', 'desc', false） |
| 128 | `getToggleSortingHandler()` | クリック時のソートハンドラ |
| 130 | `flexRender(...)` | 定義に応じてセル内容をレンダリング |
| 138 | `table.getRowModel().rows` | 現在表示すべき行を取得 |
| 140 | `row.getVisibleCells()` | 行の可視セルを取得 |

#### TanStack Table のデータフロー

```
┌──────────────────────────────────────────────────────────────┐
│                      useReactTable                           │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  data (users[])                                              │
│       ↓                                                      │
│  getCoreRowModel()  ── 基本の行モデル                          │
│       ↓                                                      │
│  getFilteredRowModel()  ── globalFilter で絞り込み             │
│       ↓                                                      │
│  getSortedRowModel()  ── sorting に基づいてソート              │
│       ↓                                                      │
│  getPaginationRowModel()  ── ページに分割                      │
│       ↓                                                      │
│  table.getRowModel().rows  ── 最終的に表示する行                │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

### 4-2. UserListPageの更新

#### 背景・目的
Step 3で作成した `UserListPage` を更新し、`UserTable` コンポーネントを使用する。削除機能と新規登録ボタンも追加する。

#### コード

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

  const handleEdit = (id: number) => {
    history.push(`/users/${id}/edit`);
  };

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

      <UserTable users={users ?? []} onEdit={handleEdit} onDelete={handleDelete} />
    </Box>
  );
};

export default UserListPage;
```

#### コード解説

| 行 | コード | 説明 |
|----|--------|------|
| 10 | `useDeleteUser()` | 削除用のmutationフック |
| 12-14 | `handleEdit` | 編集ページへの遷移（遷移ロジックをページ層に集約） |
| 16-20 | `handleDelete` | 削除確認と実行 |
| 17 | `window.confirm` | ブラウザ標準の確認ダイアログ（Step 7でMUIに差し替え） |
| 18 | `mutate(id)` | ミューテーション実行 |
| 46 | `users ?? []` | `users`が`undefined`の場合は空配列を渡す |

---

## 動作確認

**確認項目:**
- [ ] テーブルにユーザーデータが表示される
- [ ] カラムヘッダークリックでソートできる（昇順 → 降順 → なし）
- [ ] 検索ボックスに文字を入力するとフィルタされる（全カラムを検索）
- [ ] ページネーションが動作する（5, 10, 25件表示切り替え）
- [ ] 編集ボタンで `/users/:id/edit` に遷移する
- [ ] 削除ボタンで確認ダイアログ → 削除実行 → 一覧が更新される
- [ ] 「ユーザー登録」ボタンで `/users/new` に遷移する

---

## よくある質問・トラブルシューティング

### Q: TypeScriptエラー「Property 'onEdit' does not exist on type 'TableMeta'」

**A:** `meta` の型定義が不足している。ファイル内に Module Augmentation を追加：
```ts
import { RowData } from '@tanstack/react-table';

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    onEdit?: (id: number) => void;
    onDelete?: (id: number) => void;
  }
}
```

### Q: ソートアイコンが表示されない

**A:** `display` カラム（操作列など）はソート不可。`accessor` カラムのみソート可能：
```ts
// ✅ ソート可能
columnHelper.accessor('name', {...})

// ❌ ソート不可
columnHelper.display({ id: 'actions', ... })
```

### Q: フィルタが効かない

**A:** `globalFilter` と `getFilteredRowModel` が設定されているか確認：
```ts
const table = useReactTable({
  state: {
    globalFilter,  // ← これ
  },
  onGlobalFilterChange: setGlobalFilter,  // ← これ
  getFilteredRowModel: getFilteredRowModel(),  // ← これ
});
```

### Q: ページネーションがおかしい

**A:** `count` に正しい行数を渡しているか確認：
```tsx
<TablePagination
  count={table.getFilteredRowModel().rows.length}  // フィルタ後の行数
  page={table.getState().pagination.pageIndex}
  rowsPerPage={table.getState().pagination.pageSize}
/>
```

### Q: セルのカスタム描画ができない

**A:** `cell` プロパティで `info` オブジェクトを使用：
```ts
columnHelper.accessor('role', {
  cell: (info) => {
    const value = info.getValue();  // セルの値
    const row = info.row.original;   // 行全体のデータ
    return <Chip label={value} />;
  },
}),
```

---

## まとめ

このステップで学んだこと：

1. **ヘッドレスUIの概念**
   - ロジックと見た目を分離
   - 好きなUIライブラリと組み合わせ可能
   - カスタマイズの自由度が高い

2. **TanStack Table のカラム定義**
   - `createColumnHelper<T>()` で型安全なヘルパーを作成
   - `accessor` → データフィールドに紐づく（ソート・フィルタ可能）
   - `display` → 表示専用（操作ボタンなど）
   - カラム定義はコンポーネント外に置く（パフォーマンス向上）

3. **meta パターン**
   - `meta` でコールバックをテーブルに渡す
   - カラム内で `table.options.meta` から取得
   - Module Augmentation で型安全に

4. **ソート・フィルタ・ページネーション**
   - `getSortedRowModel()` でソート有効化
   - `getFilteredRowModel()` + `globalFilter` でフィルタ
   - `getPaginationRowModel()` でページネーション
   - 状態は `useState` で管理し、テーブルに渡す

5. **MUIとの統合**
   - TanStack Table のデータを MUI の Table コンポーネントで描画
   - `TableSortLabel` でソートUIを実現
   - `TablePagination` でページネーションUIを実現

---

**次のステップ:** [Step 5: React Hook Form + Yup](./step-5-form-validation.md)
