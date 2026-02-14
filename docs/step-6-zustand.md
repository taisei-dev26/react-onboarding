# Step 6: Zustand（グローバル状態管理）

## このステップで学ぶこと

- Zustand のストア作成
- セレクタによる再レンダリング最適化
- `getState()` と `useStore` の使い分け
- 通知（Snackbar）システムの実装
- サイドバー状態のグローバル管理

---

## なぜZustandを使うのか

### 課題

複数コンポーネントで状態を共有したい場合、`useState` + props のバケツリレーでは限界がある：

```tsx
// ❌ props のバケツリレー
<App notification={notification} setNotification={setNotification}>
  <Layout notification={notification} setNotification={setNotification}>
    <UserListPage setNotification={setNotification}>
      <UserTable setNotification={setNotification} />
    </UserListPage>
  </Layout>
</App>
```

**問題点:**
- 中間コンポーネントが不要な props を受け取る
- コンポーネント追加のたびに props を追加
- コードが読みにくくなる

### 解決策

Zustand はグローバル状態管理ライブラリ。どのコンポーネントからも直接状態にアクセスできる：

```tsx
// ✅ Zustand（どこからでもアクセス）
const notification = useAppStore((state) => state.notification);
const showNotification = useAppStore((state) => state.showNotification);
```

### 他の選択肢との比較

| ライブラリ | ボイラープレート | 学習コスト | Provider | 採用理由 |
|-----------|----------------|-----------|----------|---------|
| **Zustand** | 少ない | 低い | 不要 | シンプル、軽量、十分な機能 |
| Redux Toolkit | 中程度 | 中〜高 | 必要 | 大規模向け、DevTools が強力 |
| Jotai | 少ない | 低い | 不要 | アトム単位の細かい状態管理向け |
| Recoil | 中程度 | 中 | 必要 | Facebook製、実験的 |
| Context API | なし | 低い | 必要 | 状態変更のたびに全体再レンダリング |

### サーバー状態 vs クライアント状態の使い分け

| 種類 | 説明 | 例 | 管理方法 |
|------|------|-----|---------|
| サーバー状態 | サーバーに存在するデータ | ユーザー一覧、投稿記事 | React Query |
| クライアント状態 | クライアントのみで存在 | モーダル開閉、テーマ、通知 | **Zustand** |

> **ポイント:** React Query はサーバー状態、Zustand はクライアント状態、という役割分担。これにより各ライブラリの強みを活かせる。

---

## 実装手順

### 6-1. Appストア

#### 背景・目的
アプリケーション全体で使用するグローバル状態を管理するストアを作成する。このステップでは通知（Snackbar）とサイドバーの状態を管理する。

#### コード

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

#### コード解説

| 行 | コード | 説明 |
|----|--------|------|
| 1 | `import create from 'zustand'` | ストア作成関数 |
| 3-6 | `type Notification` | 通知の型定義 |
| 8-18 | `type AppState` | ストア全体の型。状態とアクションを含む |
| 10 | `notification: Notification ｜ null` | 現在の通知（nullなら非表示） |
| 11 | `showNotification: (notification) => void` | 通知を表示するアクション |
| 20-30 | `create<AppState>((set) => ({...}))` | ストアを作成 |
| 21-24 | 通知の実装 | 状態と更新関数 |
| 23 | `set({ notification })` | 状態を更新（マージ） |
| 28 | `set((state) => ({...}))` | 前の状態を参照して更新 |

#### Zustand のコア概念

```
┌────────────────────────────────────────────────────────────┐
│                      create()                              │
│                                                            │
│  (set) => ({                                               │
│    状態: 初期値,                                            │
│    アクション: (引数) => set({ 新しい状態 }),                 │
│  })                                                        │
│                                                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  set({ key: value })                                       │
│   └→ 状態オブジェクトにマージ（Reduxの spread 不要）          │
│                                                            │
│  set((state) => ({ key: !state.key }))                    │
│   └→ 前の状態を参照して更新                                  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

#### Zustand vs Redux の比較

```ts
// Redux（ボイラープレートが多い）
// 1. アクションタイプ定義
const SHOW_NOTIFICATION = 'SHOW_NOTIFICATION';
// 2. アクションクリエイター
const showNotification = (notification) => ({
  type: SHOW_NOTIFICATION,
  payload: notification,
});
// 3. リデューサー
const reducer = (state, action) => {
  switch (action.type) {
    case SHOW_NOTIFICATION:
      return { ...state, notification: action.payload };
  }
};
// 4. ストア作成
const store = createStore(reducer);
// 5. Provider でラップ
<Provider store={store}><App /></Provider>

// Zustand（シンプル）
const useAppStore = create((set) => ({
  notification: null,
  showNotification: (notification) => set({ notification }),
}));
// Provider 不要！
```

---

### 6-2. 通知（Snackbar）コンポーネント

#### 背景・目的
Zustand ストアの通知状態を監視し、通知があれば Snackbar を表示するコンポーネント。

#### コード

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

#### コード解説

| 行 | コード | 説明 |
|----|--------|------|
| 5 | `useAppStore((state) => state.notification)` | セレクタで通知状態を購読 |
| 6 | `useAppStore((state) => state.clearNotification)` | クリア関数を取得 |
| 10 | `open={!!notification}` | notificationがあればtrue |
| 11 | `autoHideDuration={4000}` | 4秒後に自動で閉じる |
| 12 | `onClose={clearNotification}` | 閉じる時にストアをクリア |
| 15-24 | `{notification ? ... : undefined}` | Snackbar の children は条件付き |

#### セレクタによる最適化

```tsx
// ❌ 非効率（ストア全体を購読）
const { notification, sidebarOpen } = useAppStore();
// → sidebarOpen が変わっても再レンダリング

// ✅ 効率的（必要な値だけ購読）
const notification = useAppStore((state) => state.notification);
// → notification が変わった時だけ再レンダリング
```

---

### 6-3. Layoutにサイドバー状態を統合

#### 背景・目的
Step 1で作成した Layout コンポーネントのサイドバー状態を、ローカル状態（useState）から Zustand に移行する。これにより、他のコンポーネントからもサイドバーを制御できるようになる。

#### コード

**`src/components/Layout.tsx`** を修正：

```tsx
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
import { useAppStore } from '../stores/useAppStore';

const DRAWER_WIDTH = 240;

const menuItems = [
  { text: 'ユーザー一覧', icon: <PeopleIcon />, path: '/' },
  { text: 'ユーザー登録', icon: <PersonAddIcon />, path: '/users/new' },
];

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  // useState から Zustand に変更
  const sidebarOpen = useAppStore((state) => state.sidebarOpen);
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen);

  const history = useHistory();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    history.push(path);
    setSidebarOpen(false);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={toggleSidebar}
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
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
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

#### 変更点

| 変更前 | 変更後 | 説明 |
|--------|--------|------|
| `useState(false)` | `useAppStore((s) => s.sidebarOpen)` | ローカル → グローバル |
| `setDrawerOpen` | `setSidebarOpen` | 命名変更 |
| `import { useState } from 'react'` | 削除 | 不要になった |

---

### 6-4. App.tsxに通知コンポーネント追加

#### 背景・目的
`NotificationSnackbar` をアプリに追加し、どのページからでも通知を表示できるようにする。

#### コード

**`src/App.tsx`** に追加：

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

---

### 6-5. フックで通知を使う

#### 背景・目的
CRUD操作の成功・失敗時に通知を表示する。mutation の `onSuccess` / `onError` コールバックからストアを更新する。

#### コード

**`src/features/users/hooks/useUsers.ts`** を更新：

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUsers, fetchUser, createUser, updateUser, deleteUser } from '../../../api/users';
import { UserFormData } from '../types';
import { useAppStore } from '../../../stores/useAppStore';

const USERS_KEY = ['users'] as const;
const userKey = (id: number) => ['users', id] as const;

export const useUsers = () => {
  return useQuery({
    queryKey: USERS_KEY,
    queryFn: fetchUsers,
  });
};

export const useUser = (id: number) => {
  return useQuery({
    queryKey: userKey(id),
    queryFn: () => fetchUser(id),
    enabled: id > 0,
  });
};

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

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const showNotification = useAppStore.getState().showNotification;

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UserFormData }) => updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY });
      showNotification({ message: 'ユーザーを更新しました', severity: 'success' });
    },
    onError: () => {
      showNotification({ message: 'ユーザーの更新に失敗しました', severity: 'error' });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  const showNotification = useAppStore.getState().showNotification;

  return useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY });
      showNotification({ message: 'ユーザーを削除しました', severity: 'success' });
    },
    onError: () => {
      showNotification({ message: 'ユーザーの削除に失敗しました', severity: 'error' });
    },
  });
};
```

#### `getState()` vs `useStore(selector)`

| 使い方 | 用途 | 再レンダリング |
|--------|------|--------------|
| `useAppStore((s) => s.xxx)` | コンポーネント内で購読 | 発生する |
| `useAppStore.getState().xxx` | イベントハンドラ、コールバック内 | 発生しない |

```tsx
// コンポーネント内（再レンダリングが必要な場合）
const notification = useAppStore((state) => state.notification);

// イベントハンドラ内（再レンダリング不要な場合）
const handleClick = () => {
  useAppStore.getState().showNotification({ ... });
};

// mutation の onSuccess（イベントハンドラと同様）
onSuccess: () => {
  useAppStore.getState().showNotification({ ... });
}
```

---

## 動作確認

**確認項目:**
- [ ] ユーザー作成後に「ユーザーを作成しました」の通知が右下に表示される
- [ ] 4秒後に通知が自動で消える
- [ ] 通知の✕ボタンで手動で閉じられる
- [ ] 編集・削除後も適切な通知が表示される
- [ ] サイドバーの開閉が正常に動作する
- [ ] ページ遷移後もサイドバー状態が維持される（Zustandで管理しているため）

---

## よくある質問・トラブルシューティング

### Q: `create` がインポートできない

**A:** Zustand v4 のインポート方法を確認：
```ts
// v4
import create from 'zustand';

// v5 (参考)
import { create } from 'zustand';
```

### Q: 通知が表示されない

**A:** 以下を確認：
1. `NotificationSnackbar` が App.tsx に追加されているか
2. `showNotification` が呼ばれているか（console.log で確認）
3. `notification` がストアに設定されているか（React DevTools で確認）

### Q: 再レンダリングが多すぎる

**A:** セレクタを使って必要な値だけ購読しているか確認：
```tsx
// ❌ 全体を購読
const store = useAppStore();

// ✅ 必要な値だけ購読
const notification = useAppStore((state) => state.notification);
```

### Q: `getState()` でエラーになる

**A:** `getState()` はストアのインスタンスメソッド：
```ts
// ✅ 正しい
useAppStore.getState().showNotification(...)

// ❌ 間違い
const { showNotification } = useAppStore.getState;  // 関数を呼んでいない
```

---

## まとめ

このステップで学んだこと：

1. **Zustand のストア作成**
   - `create((set) => ({...}))` でストアを作成
   - 状態とアクションを一つのオブジェクトに定義
   - `set()` で状態を更新（自動マージ）

2. **Redux との違い**
   - Provider 不要
   - アクションタイプ不要
   - ボイラープレートが極めて少ない

3. **セレクタによる最適化**
   - `useStore((state) => state.xxx)` で必要な値だけ購読
   - 不要な再レンダリングを防止

4. **`getState()` の使い方**
   - イベントハンドラやコールバック内で使用
   - 再レンダリングを起こさずに状態を取得・更新

5. **状態管理の使い分け**
   - サーバー状態 → React Query
   - クライアント状態 → Zustand
   - ローカル状態 → useState

---

**次のステップ:** [Step 7: 仕上げ](./step-7-finishing.md)
