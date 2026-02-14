# Step 5: React Hook Form + Yup（フォーム）

## このステップで学ぶこと

- React Hook Form の基本（useForm, Controller）
- 制御コンポーネント vs 非制御コンポーネント
- Yup によるスキーマバリデーション
- resolver パターンによる統合
- 新規作成と編集の共存パターン

---

## なぜこれらの技術を使うのか

### React Hook Form

#### 課題
フォームの状態管理を `useState` で行うと、入力フィールドごとに状態とハンドラが必要になる：

```tsx
// ❌ useState で管理（冗長）
const [name, setName] = useState('');
const [email, setEmail] = useState('');
const [role, setRole] = useState('viewer');
const [department, setDepartment] = useState('');
const [errors, setErrors] = useState<Record<string, string>>({});

const handleSubmit = () => {
  const newErrors: Record<string, string> = {};
  if (!name) newErrors.name = '名前は必須です';
  if (!email) newErrors.email = 'メールは必須です';
  // ... 他のバリデーション
  setErrors(newErrors);
  if (Object.keys(newErrors).length > 0) return;
  // 送信処理
};

return (
  <form onSubmit={handleSubmit}>
    <input value={name} onChange={(e) => setName(e.target.value)} />
    {errors.name && <span>{errors.name}</span>}
    {/* ... 他のフィールド */}
  </form>
);
```

**問題点:**
- フィールド数に比例してボイラープレートが増える
- 入力のたびに再レンダリングが発生
- バリデーションロジックが分散

#### 解決策
React Hook Form は**非制御コンポーネント**ベースのフォームライブラリ。DOMを直接参照するため、再レンダリングを最小限に抑える。

```tsx
// ✅ React Hook Form（シンプル）
const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

return (
  <form onSubmit={handleSubmit(onSubmit)}>
    <input {...register('name', { required: '名前は必須です' })} />
    {errors.name && <span>{errors.name.message}</span>}
  </form>
);
```

### Yup

#### 課題
バリデーションルールをコンポーネント内に書くと、ルールの把握・変更が困難：

```tsx
// ❌ インラインバリデーション
<input {...register('email', {
  required: 'メールは必須です',
  pattern: {
    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
    message: 'メール形式が正しくありません'
  }
})} />
```

#### 解決策
Yup はスキーマベースのバリデーションライブラリ。ルールを宣言的に定義し、フォームの外で管理できる：

```tsx
// ✅ Yup スキーマ（宣言的・再利用可能）
const schema = yup.object({
  email: yup.string().required('メールは必須です').email('メール形式が正しくありません'),
});
```

### 他の選択肢との比較

#### フォームライブラリ

| ライブラリ | アプローチ | 再レンダリング | 学習コスト | 採用理由 |
|-----------|-----------|--------------|-----------|---------|
| **React Hook Form** | 非制御 | 少ない | 低〜中 | 高パフォーマンス、プロジェクトで使用 |
| Formik | 制御 | 多い | 低 | 歴史が長いが、パフォーマンス面で劣る |
| React Final Form | 非制御 | 少ない | 中 | React Hook Formの方がエコシステムが大きい |

#### バリデーションライブラリ

| ライブラリ | 特徴 | 採用理由 |
|-----------|------|---------|
| **Yup** | 宣言的、メソッドチェーン | 直感的で人気が高い |
| Zod | TypeScript ファースト | 型推論が強力だが学習コスト高め |
| Joi | Node.js由来 | フロントエンドでは設定が複雑 |

---

## 実装手順

### 5-1. Yupバリデーションスキーマ

#### 背景・目的
フォームのバリデーションルールを1ファイルに集約する。コンポーネントから分離することで、ルールの変更・テストが容易になる。

#### コード

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

#### コード解説

| 行 | コード | 説明 |
|----|--------|------|
| 1 | `import * as yup` | Yup全体をインポート |
| 3 | `yup.object({...})` | オブジェクトスキーマを定義 |
| 4-7 | `name: yup.string()...` | nameフィールドのルール |
| 5 | `.string()` | 文字列型 |
| 6 | `.required('...')` | 必須。引数はエラーメッセージ |
| 7 | `.max(50, '...')` | 最大文字数 |
| 11 | `.email('...')` | メール形式のバリデーション |
| 15 | `.oneOf([...])` | 列挙値。指定した値以外はエラー |

#### Yup の主要メソッド

| メソッド | 説明 | 例 |
|---------|------|-----|
| `string()` | 文字列型 | `yup.string()` |
| `number()` | 数値型 | `yup.number()` |
| `required()` | 必須 | `.required('必須です')` |
| `email()` | メール形式 | `.email('無効な形式')` |
| `min(n)` | 最小値/最小文字数 | `.min(1, '1以上')` |
| `max(n)` | 最大値/最大文字数 | `.max(100, '100以下')` |
| `oneOf(arr)` | 列挙 | `.oneOf(['a', 'b'])` |
| `matches(regex)` | 正規表現 | `.matches(/^[A-Z]/)` |
| `test(name, msg, fn)` | カスタム | `.test('custom', '...', fn)` |

#### メソッドチェーンの仕組み

```ts
yup
  .string()           // 文字列スキーマを作成
  .required('必須')    // requiredルールを追加
  .email('形式不正')   // emailルールを追加
  .max(100, '長すぎ')  // maxルールを追加

// バリデーション実行時の順序:
// 1. 型チェック（string）
// 2. required チェック
// 3. email チェック
// 4. max チェック
// ※ 最初に失敗したルールのエラーメッセージが返る
```

---

### 5-2. UserFormコンポーネント

#### 背景・目的
ユーザー作成・編集用のフォームコンポーネント。React Hook Form + Controller + Yup を統合する。

#### コード

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

#### コード解説（useForm設定）

| 行 | コード | 説明 |
|----|--------|------|
| 1 | `useForm, Controller` | React Hook Formのメインフック |
| 2 | `yupResolver` | YupとReact Hook Formを橋渡しするアダプター |
| 28-40 | `useForm<UserFormData>({...})` | フォームの設定 |
| 29 | `control` | Controllerに渡すオブジェクト |
| 30 | `handleSubmit` | フォーム送信をラップする関数 |
| 31 | `formState: { errors }` | バリデーションエラー |
| 33 | `resolver: yupResolver(...)` | Yupスキーマを使用 |
| 34-39 | `defaultValues` | フォームの初期値 |

#### コード解説（Controller）

| 行 | コード | 説明 |
|----|--------|------|
| 45-56 | `<Controller>` | 制御コンポーネントをReact Hook Formに接続 |
| 46 | `name="name"` | フォームフィールド名 |
| 47 | `control={control}` | useFormから取得したcontrol |
| 48-55 | `render={({ field }) => ...}` | UIコンポーネントをレンダリング |
| 50 | `{...field}` | `value`, `onChange`, `onBlur`, `ref` をスプレッド |
| 52 | `error={!!errors.name}` | エラー状態 |
| 53 | `helperText={errors.name?.message}` | エラーメッセージ |

#### なぜ Controller が必要なのか

```
┌──────────────────────────────────────────────────────────────┐
│                    非制御コンポーネント                        │
│                                                              │
│  <input {...register('name')} />                             │
│                                                              │
│  ・DOM を直接参照（ref）                                       │
│  ・React 状態を使わない                                        │
│  ・再レンダリングが少ない                                       │
│  ・ネイティブ input 要素向き                                    │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    制御コンポーネント                          │
│                                                              │
│  <TextField value={value} onChange={onChange} />              │
│                                                              │
│  ・内部で state を管理                                        │
│  ・MUI TextField, Select など                                │
│  ・register() では動作しない                                   │
│  ・Controller で接続する必要あり                               │
└──────────────────────────────────────────────────────────────┘
```

#### `register` vs `Controller`

| 項目 | register | Controller |
|------|----------|------------|
| 対象 | ネイティブ input | 制御コンポーネント（MUI等） |
| 仕組み | ref で DOM 直接参照 | state を経由 |
| コード量 | 少ない | やや多い |
| パフォーマンス | 最高 | 高い |

```tsx
// register（ネイティブ input）
<input {...register('name')} />

// Controller（MUI TextField）
<Controller
  name="name"
  control={control}
  render={({ field }) => <TextField {...field} />}
/>
```

#### `yupResolver` の役割

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│ React Hook  │     │  yupResolver │     │    Yup      │
│    Form     │ ──→ │   (アダプター) │ ──→ │  Schema     │
│             │ ←── │              │ ←── │             │
└─────────────┘     └──────────────┘     └─────────────┘
     errors              変換                validate
```

`yupResolver` がやっていること：
1. フォーム送信時に Yup スキーマで検証
2. Yup のエラー形式を React Hook Form のエラー形式に変換
3. エラーオブジェクトを `formState.errors` に設定

---

### 5-3. UserFormPage

#### 背景・目的
ユーザー作成・編集ページ。URLパラメータ（`:id`）の有無で新規/編集を判断する。

#### コード

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

#### コード解説

| 行 | コード | 説明 |
|----|--------|------|
| 14 | `useParams<{ id?: string }>()` | URLから`:id`を取得。オプショナル型 |
| 15 | `isEdit = !!id` | idがあれば編集モード |
| 16 | `userId = Number(id)` | 文字列を数値に変換 |
| 18 | `useUser(userId)` | 編集時のみユーザー詳細を取得 |
| 19-20 | `useCreateUser/useUpdateUser` | mutation フック |
| 22-32 | `handleSubmit` | 新規/編集を判断して適切なmutationを実行 |
| 26 | `onSuccess: () => history.push('/')` | 成功後に一覧ページへ遷移 |
| 34-40 | `if (isEdit && isLoading)` | 編集モードでデータ取得中のみローディング表示 |
| 42-44 | `defaultValues` | 編集時は既存データ、新規時はundefined |

#### 新規作成 vs 編集の判断フロー

```
URL: /users/new
├── id: undefined
├── isEdit: false
├── useUser: enabled: false（フェッチしない）
├── defaultValues: undefined
└── handleSubmit: createMutation.mutate()

URL: /users/1/edit
├── id: "1"
├── isEdit: true
├── useUser: enabled: true（フェッチする）
├── defaultValues: { name: "...", ... }
└── handleSubmit: updateMutation.mutate({ id: 1, data })
```

---

### 5-4. App.tsxの更新

#### 背景・目的
仮のコンポーネントを本物の `UserFormPage` に差し替える。

#### コード

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

---

## 動作確認

**確認項目:**
- [ ] 「ユーザー登録」ページでフォームが表示される
- [ ] 空欄で送信するとバリデーションエラーが表示される
- [ ] 不正なメールアドレスでエラーが表示される
- [ ] 正しく入力して送信すると一覧に戻り、新しいユーザーが追加されている
- [ ] 一覧の編集ボタンから編集画面に遷移し、既存データがフォームに入っている
- [ ] 編集して保存すると一覧に反映される
- [ ] 保存中はボタンが「保存中...」になり、無効化される

---

## よくある質問・トラブルシューティング

### Q: バリデーションが実行されない

**A:** `resolver` が設定されているか確認：
```ts
useForm({
  resolver: yupResolver(userSchema),  // ← これが必要
});
```

### Q: `Cannot read properties of undefined (reading 'control')`

**A:** `useForm` の返り値から `control` を取り出しているか確認：
```ts
const { control, handleSubmit, formState: { errors } } = useForm({...});
```

### Q: デフォルト値が反映されない

**A:** `defaultValues` はコンポーネントのマウント時にのみ適用される。動的に変更するには `reset()` を使用：
```ts
const { reset } = useForm({...});

useEffect(() => {
  if (user) {
    reset({ name: user.name, email: user.email, ... });
  }
}, [user, reset]);
```

### Q: Select の値が空になる

**A:** MUI の Select は `value=""` で空の状態を示す。初期値を設定するか、Controller のデフォルト値を確認：
```ts
defaultValues: {
  role: 'viewer',  // ← 空文字ではなく有効な値を設定
}
```

### Q: エラーメッセージが英語で表示される

**A:** Yup スキーマでカスタムメッセージを指定：
```ts
yup.string().required('名前は必須です')  // ← 日本語メッセージ
```

---

## まとめ

このステップで学んだこと：

1. **React Hook Form の基本**
   - `useForm` でフォーム状態を管理
   - `handleSubmit` で送信処理をラップ
   - `formState.errors` でバリデーションエラーを取得

2. **Controller の役割**
   - MUI などの制御コンポーネントを React Hook Form に接続
   - `field` オブジェクト（value, onChange, onBlur, ref）をスプレッド

3. **Yup スキーマバリデーション**
   - 宣言的にルールを定義
   - メソッドチェーンで複数ルールを組み合わせ
   - コンポーネント外で管理し再利用可能

4. **yupResolver によるアダプター**
   - Yup と React Hook Form を統合
   - Yup エラーを React Hook Form エラー形式に変換

5. **新規/編集の共存パターン**
   - URL パラメータで判断
   - 同じフォームコンポーネントを使い回す
   - `defaultValues` で初期値を切り替え

---

**次のステップ:** [Step 6: Zustand](./step-6-zustand.md)
