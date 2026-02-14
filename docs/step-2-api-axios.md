# Step 2: json-server + Axios + 型定義

## このステップで学ぶこと

- REST APIの基本設計（CRUD操作）
- json-serverによるモックAPI作成
- Axiosインスタンスの作成とインターセプター
- TypeScriptの型定義とユーティリティ型

---

## なぜこれらの技術を使うのか

### json-server

#### 課題
- バックエンドがまだ完成していない段階でフロントエンド開発を進めたい
- 本物のAPIを待っていると開発が止まる

#### 解決策
json-serverは、JSONファイルを元に自動でREST APIを生成する。わずか数分でCRUD操作可能なAPIモックが完成する。

#### 他の選択肢との比較

| ツール | 特徴 | 採用理由 |
|--------|------|---------|
| **json-server** | JSONファイルだけでREST API | シンプルで学習コストが低い |
| MSW (Mock Service Worker) | Service Workerでリクエストをインターセプト | 本番に近いがセットアップが複雑 |
| Mirage JS | クライアントサイドモック | json-serverより設定が多い |
| 実際のバックエンド | 本物のAPI | 開発に時間がかかる |

### Axios

#### 課題
- `fetch` APIは低レベルで、エラーハンドリングやリクエスト設定が冗長になる
- 認証トークンの付与など、共通処理を毎回書きたくない

#### 解決策
Axiosはリクエスト/レスポンスのインターセプター、インスタンス設定、自動JSONパースなどを提供する。

#### fetch vs Axios

| 機能 | fetch | Axios |
|------|-------|-------|
| JSONパース | 手動（`res.json()`） | 自動 |
| エラーハンドリング | 4xx/5xxもresolve | 4xx/5xxはreject |
| タイムアウト | 手動実装 | `timeout` オプション |
| インターセプター | なし | あり |
| ブラウザ対応 | モダンブラウザのみ | IE11も対応（ポリフィル込み） |

---

## 実装手順

### 2-1. モックデータ作成

#### 背景・目的
json-serverのデータソースとなるJSONファイルを作成する。このファイルがデータベースの代わりになる。

#### コード

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

#### データ構造の解説

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `id` | number | json-serverが自動採番（POST時） |
| `name` | string | ユーザー名 |
| `email` | string | メールアドレス（一意であるべき） |
| `role` | `'admin'｜'editor'｜'viewer'` | 権限レベル |
| `department` | string | 所属部署 |
| `createdAt` | string (ISO 8601) | 作成日時 |

#### json-serverが自動生成するエンドポイント

| HTTP | エンドポイント | 操作 |
|------|---------------|------|
| GET | `/users` | 全ユーザー取得 |
| GET | `/users/1` | ID=1のユーザー取得 |
| POST | `/users` | ユーザー作成（idは自動採番） |
| PUT | `/users/1` | ID=1のユーザーを完全置換 |
| PATCH | `/users/1` | ID=1のユーザーを部分更新 |
| DELETE | `/users/1` | ID=1のユーザーを削除 |

---

### 2-2. json-serverの起動スクリプト

#### 背景・目的
開発時にAPIサーバーとフロントエンドを同時に起動できるようにする。

#### コード

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

#### スクリプト解説

| スクリプト | コマンド | 説明 |
|-----------|---------|------|
| `server` | `json-server --watch db.json --port 3001` | APIサーバー起動 |
| `dev` | `concurrently "npm start" "npm run server"` | 両方同時起動 |

#### オプション解説

| オプション | 意味 |
|-----------|------|
| `--watch` | db.jsonの変更を監視し、自動リロード |
| `--port 3001` | ポート番号指定（Reactは3000を使うため分離） |

#### concurrentlyのインストール（オプション）

```bash
npm install -D concurrently
```

> **代替方法:** ターミナルを2つ開いて `npm start` と `npm run server` を別々に実行してもOK。

---

### 2-3. 型定義

#### 背景・目的
TypeScriptの型を定義することで、コンパイル時にエラーを検出し、エディタの補完を活用できる。

#### コード

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

#### コード解説

| 行 | コード | 説明 |
|----|--------|------|
| 1 | `type Role = 'admin' ｜ 'editor' ｜ 'viewer'` | 文字列リテラル型のユニオン。この3つ以外を代入するとエラー |
| 3-10 | `type User` | ユーザーの完全な型定義。APIレスポンスの形状と一致 |
| 13 | `Omit<User, 'id' ｜ 'createdAt'>` | Userから指定キーを除いた新しい型を生成 |

#### TypeScript ユーティリティ型の解説

```ts
// Omit: 指定したキーを除外
type UserFormData = Omit<User, 'id' | 'createdAt'>;
// 結果: { name: string; email: string; role: Role; department: string; }

// Pick: 指定したキーだけを抽出
type UserName = Pick<User, 'name' | 'email'>;
// 結果: { name: string; email: string; }

// Partial: すべてのキーをオプショナルに
type PartialUser = Partial<User>;
// 結果: { id?: number; name?: string; ... }

// Required: すべてのキーを必須に
type RequiredUser = Required<PartialUser>;
// 結果: { id: number; name: string; ... }
```

#### なぜ `UserFormData` を分けるのか

| 型 | 用途 | id | createdAt |
|----|------|-----|-----------|
| `User` | APIレスポンス、表示用 | あり | あり |
| `UserFormData` | フォーム送信、作成/更新リクエスト | なし | なし |

- `id` はサーバーが自動採番するため、クライアントからは送らない
- `createdAt` は作成時にサーバーで設定するため、フォームには不要

---

### 2-4. Axiosインスタンス

#### 背景・目的
Axiosインスタンスを作成し、共通設定（baseURL、ヘッダー）を一箇所にまとめる。将来的に認証トークンの付与やエラーログなどの共通処理を追加できる。

#### コード

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

#### コード解説

| 行 | コード | 説明 |
|----|--------|------|
| 3-8 | `axios.create({...})` | 設定済みのAxiosインスタンスを生成 |
| 4 | `baseURL` | 全リクエストの基準URL。相対パス `/users` は `http://localhost:3001/users` になる |
| 5-7 | `headers` | 全リクエストに付与するヘッダー |
| 11-16 | `interceptors.response.use` | レスポンスを受け取った後に実行される処理 |
| 12 | `(response) => response` | 成功時はそのまま通す |
| 13-16 | `(error) => {...}` | エラー時の処理。ログ出力して再スロー |
| 14 | `error.response?.status` | HTTPステータスコード（404, 500など） |

#### インターセプターの活用例

```ts
// リクエストインターセプター（認証トークン付与）
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// レスポンスインターセプター（401で自動ログアウト）
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // ログアウト処理
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

#### Axiosインスタンスを作るメリット

| 観点 | 直接axios使用 | インスタンス使用 |
|------|--------------|-----------------|
| baseURL | 毎回フルURL指定 | 相対パスでOK |
| 共通ヘッダー | 毎回指定 | 設定で一括 |
| 環境切り替え | 全箇所修正 | 1箇所修正 |
| 共通処理 | 各所に分散 | インターセプターで集約 |

---

### 2-5. ユーザーAPI関数

#### 背景・目的
API呼び出しを関数として切り出す。コンポーネントから直接Axiosを呼ばずに、この関数経由で呼ぶことで、エンドポイントの変更が1箇所で済む。

#### コード

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

#### コード解説

| 行 | コード | 説明 |
|----|--------|------|
| 5 | `async (): Promise<User[]>` | 非同期関数。User配列を返すPromise |
| 6 | `apiClient.get<User[]>` | ジェネリクスでレスポンス型を指定 |
| 6 | `const { data }` | Axiosレスポンスから`data`プロパティを分割代入 |
| 18-21 | `post('/users', {...})` | 第2引数がリクエストボディ |
| 19 | `...userData` | スプレッド演算子でオブジェクトを展開 |
| 20 | `createdAt: new Date().toISOString()` | 作成日時を現在時刻で設定 |
| 27 | `put('/users/${id}', {...})` | 完全置換（PATCHは部分更新） |

#### REST API設計のCRUD対応

| 操作 | HTTP | エンドポイント | 関数名 |
|------|------|---------------|--------|
| Create | POST | `/users` | `createUser` |
| Read (一覧) | GET | `/users` | `fetchUsers` |
| Read (詳細) | GET | `/users/:id` | `fetchUser` |
| Update | PUT | `/users/:id` | `updateUser` |
| Delete | DELETE | `/users/:id` | `deleteUser` |

#### API関数を分離する理由

```tsx
// ❌ コンポーネントで直接呼ぶ（非推奨）
const UserListPage = () => {
  useEffect(() => {
    axios.get('http://localhost:3001/users').then(...)
  }, []);
};

// ✅ API関数経由で呼ぶ（推奨）
const UserListPage = () => {
  useEffect(() => {
    fetchUsers().then(...)
  }, []);
};
```

| 観点 | 直接呼び出し | API関数経由 |
|------|-------------|------------|
| URL変更 | 全コンポーネント修正 | 関数内を1箇所修正 |
| 型安全 | 毎回ジェネリクス指定 | 関数に型が付いている |
| テスト | モック設定が複雑 | 関数をモックするだけ |
| 再利用 | コピペ | importするだけ |

---

## 動作確認

ターミナル1で json-server を起動：
```bash
npm run server
```

ターミナル2で curl でAPIを確認：
```bash
# 全ユーザー取得
curl http://localhost:3001/users

# 特定ユーザー取得
curl http://localhost:3001/users/1

# ユーザー作成
curl -X POST http://localhost:3001/users \
  -H "Content-Type: application/json" \
  -d '{"name":"山田次郎","email":"yamada@example.com","role":"viewer","department":"総務部","createdAt":"2025-06-01T00:00:00Z"}'

# ユーザー更新
curl -X PUT http://localhost:3001/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"田中太郎（更新）","email":"tanaka@example.com","role":"admin","department":"開発部","createdAt":"2025-01-15T09:00:00Z"}'

# ユーザー削除
curl -X DELETE http://localhost:3001/users/6
```

**確認項目:**
- [ ] `http://localhost:3001/users` でユーザー一覧のJSONが返る
- [ ] `http://localhost:3001/users/1` で田中太郎のデータが返る
- [ ] POSTでユーザーが追加される（db.jsonが更新される）
- [ ] PUTでユーザーが更新される
- [ ] DELETEでユーザーが削除される

---

## よくある質問・トラブルシューティング

### Q: json-serverが起動しない

**A:** 以下を確認：
1. `db.json` がプロジェクトルートにあるか
2. JSONの文法エラーがないか（末尾カンマなど）
3. 他のプロセスがポート3001を使っていないか

```bash
# ポート使用状況確認
lsof -i :3001
```

### Q: CORSエラーが出る

**A:** json-serverはデフォルトでCORSを許可している。それでもエラーが出る場合：
1. ブラウザの拡張機能が干渉していないか確認
2. `--no-cors` オプションは使わない（これは別の意味）

### Q: TypeScriptエラー `Type 'string' is not assignable to type 'Role'`

**A:** APIレスポンスの`role`が`string`として認識されている。明示的に型をアサート：
```ts
const { data } = await apiClient.get<User>(`/users/${id}`);
// または型ガードを使用
```

### Q: `db.json` が壊れた

**A:** json-serverは`db.json`を直接書き換える。gitで復元するか、初期データを再作成：
```bash
git checkout db.json
```

---

## まとめ

このステップで学んだこと：

1. **json-server**
   - JSONファイルだけでREST APIモックが作れる
   - CRUD操作に対応したエンドポイントが自動生成される
   - `--watch` で変更を監視

2. **TypeScript型定義**
   - `type` でオブジェクトの形状を定義
   - `Omit` で既存型から一部を除いた新しい型を作成
   - 型定義により補完とエラー検出が効く

3. **Axiosインスタンス**
   - `axios.create()` で共通設定をまとめる
   - インターセプターで共通処理を集約
   - 認証トークン付与やエラーログに活用

4. **API関数の分離**
   - コンポーネントから直接Axiosを呼ばない
   - エンドポイント変更が1箇所で済む
   - テストやリファクタリングがしやすい

---

**次のステップ:** [Step 3: React Query + ユーザー一覧](./step-3-react-query.md)
