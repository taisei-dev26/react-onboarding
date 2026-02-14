# Step 1: 環境構築 + Material UI基盤

## このステップで学ぶこと

- MUI v5のセットアップとテーマ設定
- React Router v5によるルーティング
- プロバイダーの入れ子構造と順序の意味
- 共通レイアウトコンポーネントの設計

---

## なぜこれらの技術を使うのか

### Material UI (MUI)

#### 課題
- 一からCSSを書くと時間がかかる
- デザインの一貫性を保つのが難しい
- アクセシビリティ対応が大変

#### 解決策
MUIはGoogleのMaterial Designガイドラインに準拠したコンポーネントライブラリ。プロダクション品質のUIを素早く構築できる。

#### 他の選択肢との比較

| ライブラリ | 特徴 | 採用理由 |
|-----------|------|---------|
| **MUI** | Material Design準拠、豊富なコンポーネント | プロジェクトで使用予定 |
| Chakra UI | シンプルなAPI、カスタマイズしやすい | MUIほどコンポーネントが多くない |
| Ant Design | 企業向けUI、中国発 | 日本語情報が少ない |
| Tailwind CSS | ユーティリティファースト | コンポーネントは自作が必要 |

### React Router v5

#### 課題
- SPAでページ遷移を実現したい
- URLに応じて異なるコンポーネントを表示したい
- ブラウザの戻る/進むボタンに対応したい

#### 解決策
React Routerはクライアントサイドルーティングを実現する。実際にはページ遷移せず、URLに応じてコンポーネントを切り替える。

#### なぜv5なのか

| バージョン | 特徴 | React対応 |
|-----------|------|----------|
| v5 | `Switch`, `Route`, `useHistory` | React 17対応 |
| v6 | `Routes`, `Route`, `useNavigate` | React 18必須 |

> **注意:** v6はAPIが大きく変更されている。本番プロジェクトがv5を使用しているため、v5で学習する。

---

## 実装手順

### 1-1. パッケージインストール

#### 背景・目的
すべての依存パッケージを一度にインストールする。開発中にバージョン不整合を防ぐため、明示的にバージョンを指定している。

#### コマンド

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

#### パッケージ解説

| パッケージ | 役割 | 補足 |
|-----------|------|------|
| `@mui/material@5` | MUIコンポーネント本体 | v5はEmotionベース |
| `@mui/icons-material@5` | MUIアイコン集 | Google Material Icons |
| `@emotion/react` | CSSランタイム | MUIのスタイリングエンジン |
| `@emotion/styled` | styled-components風API | MUIが内部で使用 |
| `react-router-dom@5` | ルーティング | v5をTypeScriptで使用 |
| `@types/react-router-dom@5` | TypeScript型定義 | v5用の型定義 |

> **なぜ `@emotion/react` と `@emotion/styled` が必要？**
> MUI v5はスタイリングエンジンとしてEmotionを採用している。この2つはMUIのピア依存（peer dependency）であり、インストールしないとMUIコンポーネントが正しく動作しない。

---

### 1-2. 不要ファイルの削除

#### 背景・目的
Create React App（CRA）のデフォルトファイルには、学習の邪魔になるものがある。クリーンな状態から始める。

#### コマンド

```bash
rm src/App.css src/logo.svg src/reportWebVitals.ts src/setupTests.ts src/App.test.tsx
```

#### 削除するファイルの説明

| ファイル | 理由 |
|---------|------|
| `App.css` | MUIの`sx` propを使うため不要 |
| `logo.svg` | CRAのロゴ、使わない |
| `reportWebVitals.ts` | パフォーマンス計測、今回は不要 |
| `setupTests.ts` | テスト設定、Step 1では不要 |
| `App.test.tsx` | デフォルトテスト、書き直すため削除 |

---

### 1-3. エントリポイント修正

#### 背景・目的
Reactアプリケーションの起点となるファイル。ここで各種プロバイダー（Provider）を設定し、アプリ全体で使えるようにする。

#### コード

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

#### コード解説

| 行 | コード | 説明 |
|----|--------|------|
| 1-2 | `import React/ReactDOM` | React 17では明示的なimportが必要（JSX transformで省略可能だが互換性のため記載） |
| 3 | `ThemeProvider, createTheme, CssBaseline` | MUIのテーマ機能とCSSリセット |
| 4 | `BrowserRouter` | HTML5 History APIを使ったルーター |
| 6-12 | `createTheme({...})` | アプリ全体のテーマ（色、フォント等）を定義 |
| 8 | `main: '#1976d2'` | MUIのデフォルトブルー。変更すればアプリ全体の主色が変わる |
| 15 | `<BrowserRouter>` | URLパスに基づくルーティングを有効化 |
| 16 | `<ThemeProvider>` | 子コンポーネントにテーマを提供 |
| 17 | `<CssBaseline />` | ブラウザ間のCSS差異をリセット（normalize.cssのMUI版） |

#### プロバイダーの入れ子順序

```
React.StrictMode
  └── BrowserRouter      ← 最外側: ルーティングはどこでも使う
        └── ThemeProvider  ← 中間: テーマはUI部品に必要
              └── CssBaseline  ← 最初に適用: CSSリセット
                    └── App      ← アプリ本体
```

**なぜこの順序なのか？**

| 順序 | プロバイダー | 理由 |
|------|-------------|------|
| 1 | `BrowserRouter` | ルーティングはアプリ全体で使う。ThemeProvider内のコンポーネントもナビゲーションする |
| 2 | `ThemeProvider` | MUIコンポーネントがテーマを参照するため、それらより外側に置く |
| 3 | `CssBaseline` | 最初にCSSをリセットしてから、他のスタイルを適用 |

**順序を変えるとどうなる？**
- `ThemeProvider` が `BrowserRouter` の外にあっても動作するが、コンベンション違反
- `CssBaseline` が `App` の後にあると、リセットが遅れて一瞬スタイル崩れが見える

---

### 1-4. 共通Layoutコンポーネント

#### 背景・目的
全ページで共通のヘッダー（AppBar）とサイドバー（Drawer）を持つレイアウトを作成する。各ページはこのレイアウトの中にレンダリングされる。

#### コード

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

#### コード解説

| 行 | コード | 説明 |
|----|--------|------|
| 1 | `useState` | Drawerの開閉状態をローカルで管理（Step 6でZustandに移行） |
| 2 | `useHistory, useLocation` | React Router v5のフック。v6では`useNavigate`, `useLocation`に変更 |
| 19 | `DRAWER_WIDTH = 240` | サイドバーの幅。定数化して複数箇所で一貫した値を使う |
| 21-24 | `menuItems` | メニュー項目を配列で管理。追加・変更が容易 |
| 31 | `useHistory()` | 履歴オブジェクトを取得。`push`でページ遷移 |
| 32 | `useLocation()` | 現在のURL情報を取得。`pathname`で現在のパス |
| 35 | `history.push(path)` | プログラムによるページ遷移 |
| 41 | `position="fixed"` | AppBarを画面上部に固定 |
| 55 | `variant="temporary"` | オーバーレイ式Drawer。`permanent`は常時表示 |
| 62 | `'& .MuiDrawer-paper'` | MUIの内部クラスをセレクタで指定（Emotion記法） |
| 64 | `<Toolbar />` | AppBarの高さ分のスペーサー。これがないとコンテンツがAppBarの下に隠れる |
| 68 | `selected={...}` | 現在のパスと一致していればハイライト表示 |
| 76 | `<Toolbar />` | ここでもスペーサー。main領域がAppBarに隠れないようにする |

#### React Router v5 ナビゲーションの仕組み

```tsx
// v5（このプロジェクト）
const history = useHistory();
history.push('/users/new');  // ページ遷移

// v6（参考）
const navigate = useNavigate();
navigate('/users/new');      // ページ遷移
```

| v5 | v6 | 説明 |
|----|-----|------|
| `useHistory()` | `useNavigate()` | フック名の変更 |
| `history.push(path)` | `navigate(path)` | 遷移メソッド |
| `history.replace(path)` | `navigate(path, { replace: true })` | 履歴を残さず遷移 |
| `history.goBack()` | `navigate(-1)` | 戻る |

---

### 1-5. ルーティング設定

#### 背景・目的
URLパスに応じて表示するコンポーネントを切り替える。この段階では仮のコンポーネントを使い、後のステップで本物に差し替える。

#### コード

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

#### コード解説

| 行 | コード | 説明 |
|----|--------|------|
| 1 | `Route, Switch` | v5のルーティングコンポーネント。v6では`Routes`に変更 |
| 11 | `<Switch>` | 最初にマッチしたRouteだけをレンダリング |
| 12 | `exact path="/"` | 完全一致。これがないと`/users/new`も`/`にマッチしてしまう |
| 14 | `/users/:id/edit` | `:id`はURLパラメータ。コンポーネント内で`useParams()`で取得 |

#### React Router v5 の `Switch` の動作

```
URL: /users/new

<Switch>なしの場合:
  /              → マッチ（/users/new は / で始まる）
  /users/new     → マッチ
  → 両方レンダリングされる！

<Switch>ありの場合:
  /              → マッチするが exact なので完全一致しない
  /users/new     → 完全一致
  → UserFormPage だけがレンダリングされる
</Switch>
```

#### v5 vs v6 のルーティング記法

```tsx
// v5（このプロジェクト）
<Switch>
  <Route exact path="/" component={UserListPage} />
  <Route path="/users/:id" component={UserDetailPage} />
</Switch>

// v6（参考）
<Routes>
  <Route path="/" element={<UserListPage />} />
  <Route path="/users/:id" element={<UserDetailPage />} />
</Routes>
```

| v5 | v6 | 説明 |
|----|-----|------|
| `<Switch>` | `<Routes>` | コンテナ名の変更 |
| `component={Comp}` | `element={<Comp />}` | propsの渡し方が変わった |
| `exact` | 不要 | v6はデフォルトで完全一致 |

---

## 動作確認

```bash
npm start
```

**確認項目:**
- [ ] AppBarに「ユーザー管理システム」が表示される
- [ ] ハンバーガーメニュークリックでDrawerが開く
- [ ] メニュー選択で画面が切り替わる（「ユーザー一覧ページ」「ユーザー登録ページ」の仮テキスト）
- [ ] URLが `/` と `/users/new` で変わる
- [ ] ブラウザの戻る/進むボタンが機能する

---

## よくある質問・トラブルシューティング

### Q: `Module not found: Can't resolve '@emotion/react'` エラーが出る

**A:** Emotionパッケージがインストールされていない。以下を実行：
```bash
npm install @emotion/react @emotion/styled
```

### Q: TypeScriptエラー `Cannot find module 'react-router-dom'` が出る

**A:** 型定義がインストールされていない。以下を実行：
```bash
npm install @types/react-router-dom@5
```

### Q: AppBarとコンテンツが重なる

**A:** `<Toolbar />` スペーサーが入っていない。Layoutコンポーネントの以下の位置に追加：
- Drawer内の先頭
- main領域の先頭

```tsx
<Box component="main">
  <Toolbar />  {/* ← これが必要 */}
  {children}
</Box>
```

### Q: Drawerが閉じない

**A:** `onClose` ハンドラが設定されているか確認：
```tsx
<Drawer
  open={drawerOpen}
  onClose={() => setDrawerOpen(false)}  // ← これが必要
>
```

---

## まとめ

このステップで学んだこと：

1. **MUI v5のセットアップ**
   - Emotionがスタイリングエンジン
   - `createTheme` でアプリ全体のテーマを定義
   - `CssBaseline` でブラウザ間の差異をリセット

2. **プロバイダーの入れ子構造**
   - 外側から順に：Router → Theme → App
   - 依存関係に基づいて順序を決める

3. **React Router v5**
   - `Switch` で最初のマッチだけレンダリング
   - `exact` で完全一致を指定
   - `useHistory().push()` でプログラム的遷移

4. **共通レイアウトパターン**
   - `children` propで任意のコンテンツを受け入れる
   - AppBarとDrawerを全ページで共有

---

**次のステップ:** [Step 2: json-server + Axios + 型定義](./step-2-api-axios.md)
