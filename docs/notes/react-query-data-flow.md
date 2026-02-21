# React Query データフローとキャッシュの仕組み

## 対象コード

| ファイル | 役割 |
|---|---|
| `src/features/users/pages/UserListPage.tsx` | UIコンポーネント |
| `src/features/users/hooks/useUsers.ts` | React Query hooks |
| `src/api/users.ts` | API関数 |
| `src/api/client.ts` | Axiosインスタンス |

---

## 一覧取得（GET /users）の流れ

```
UserListPage.tsx
  └─ useUsers()                             ← hooks/useUsers.ts
       └─ useQuery({ queryFn: fetchUsers })
            └─ fetchUsers()                 ← api/users.ts
                 └─ apiClient.get('/users') ← api/client.ts
                      └─ GET http://localhost:3001/users
                           └─ json-server (db.json)
```

### 各レイヤーの責務

#### 1. UserListPage（UIレイヤー）

```tsx
const { data: users, isLoading, isError, error } = useUsers();
```

- `useUsers()` を呼ぶだけ。HTTP・Axios・URLを一切知らない
- `isLoading` → ローディングスピナーを表示
- `isError` → エラーメッセージを表示
- 成功 → `users.map()` でテーブル行を描画

#### 2. useUsers（React Queryレイヤー）

```ts
const USERS_KEY = ['users'] as const;

export const useUsers = () => {
    return useQuery({
        queryKey: USERS_KEY,   // キャッシュの「住所」
        queryFn: fetchUsers    // キャッシュがなければ実行
    });
};
```

- `queryKey` がキャッシュの識別子
- キャッシュにデータがあれば `fetchUsers` を呼ばずに即返す
- キャッシュがなければ `fetchUsers` を実行し、結果をキャッシュに保存

#### 3. fetchUsers（APIレイヤー）

```ts
export const fetchUsers = async (): Promise<User[]> => {
    const { data } = await apiClient.get<User[]>('/users');
    return data;
}
```

- Axiosで `/users` にGETリクエスト
- `{ data }` はAxiosレスポンスの `response.data` を取り出している
- `Promise<User[]>` を返す

#### 4. apiClient（Axiosレイヤー）

```ts
axios.create({ baseURL: 'http://localhost:3001' })
// → GET http://localhost:3001/users
```

- baseURL + パスを結合して完全なURLを構築
- interceptorでエラーをコンソールに出力してから reject

---

## キャッシュの仕組み

### キャッシュなし（初回アクセス）

```
UserListPage マウント
  ↓ isLoading: true → <CircularProgress /> 表示
  ↓ fetchUsers() 実行
  ↓ GET http://localhost:3001/users
  ↓ json-server がレスポンスを返す
  ↓ React Query がキャッシュ ['users'] に保存
  ↓ isLoading: false, data: User[]
  ↓ テーブルを描画 ✅

⏱ ネットワーク往復時間ぶん待つ
```

### キャッシュあり（2回目以降）

```
UserListPage マウント
  ↓ キャッシュ ['users'] を確認 → データあり
  ↓ 即座に data: User[] を返す
  ↓ テーブルを描画 ✅（ローディング画面なし）
  ↓ ※ staleTime の設定次第でバックグラウンド再フェッチも走る

⏱ ほぼ 0ms
```

### stale-while-revalidate 戦略

React Queryのデフォルト動作は **「古いデータでもまず見せ、裏で更新する」**。

| 設定 | デフォルト値 | 挙動 |
|---|---|---|
| `staleTime` | `0ms` | キャッシュは即座に「古い（stale）」扱い |
| `cacheTime` | `5分` | 未使用キャッシュを保持する時間 |
| `refetchOnWindowFocus` | `true`（このプロジェクトは `false`）| タブ切替時に再フェッチするか |

```
staleTime: 0（デフォルト）の挙動
─────────────────────────────────
1. キャッシュのデータを即座に画面に表示（ローディングなし）
2. 同時に裏でバックグラウンド再フェッチを実行
3. 新しいデータが届いたら静かに更新
```

### staleTime を変えると？

```ts
// 変更頻度が低いデータ（マスタデータなど）
useQuery({
    queryKey: USERS_KEY,
    queryFn: fetchUsers,
    staleTime: 5 * 60 * 1000  // 5分間はバックグラウンド再フェッチなし
})
```

---

## 書き込み後のキャッシュ更新

ユーザー作成・更新後は `invalidateQueries` でキャッシュを無効化し、自動的に再フェッチが走る。

```
useCreateUser().mutate(formData)
  ↓ POST /users
  ↓ 成功
  ↓ invalidateQueries({ queryKey: ['users'] })
  ↓ キャッシュを「古い」とマーク
  ↓ useUsers() が自動的に再フェッチ
  ↓ UserListPage が最新データで再描画 ✅
```

> `queryKey: ['users']` が `useQuery` と `invalidateQueries` で一致していることが重要。
> このプロジェクトでは `USERS_KEY` 定数として一元管理している（`hooks/useUsers.ts`）。

---

## まとめ：UIがAPIを知らない設計

```
UserListPage  →  useUsers()  →  fetchUsers()  →  apiClient
    UI              状態管理        API関数          HTTP
```

各レイヤーは隣のレイヤーしか知らない。`UserListPage` はAxiosを、`fetchUsers` はReact Queryを意識しない。この**関心の分離**により、APIのURLが変わっても `api/users.ts` だけを変えれば済む。
