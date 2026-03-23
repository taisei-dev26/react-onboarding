/**
 * useState の練習
 *
 * 基本: const [state, setState] = useState(initialValue)
 * - state: 現在の値
 * - setState: 値を更新する関数（呼び出すと再レンダリングが起きる）
 * - initialValue: 初期値（関数を渡すと遅延初期化になる）
 */

import { useState } from 'react';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';

// ① プリミティブな状態
function CounterSection() {
  const [count, setCount] = useState(0);

  return (
    <Box>
      <Typography variant="h6">① カウンター（プリミティブ）</Typography>
      <Typography>count: {count}</Typography>
      <Stack direction="row" spacing={1} mt={1}>
        <Button variant="outlined" onClick={() => setCount(count - 1)}>-1</Button>
        <Button variant="outlined" onClick={() => setCount(0)}>リセット</Button>
        {/* 関数型更新: 前の値を確実に参照したい場合に使う */}
        <Button variant="outlined" onClick={() => setCount(prev => prev + 1)}>+1 (関数型)</Button>
      </Stack>
    </Box>
  );
}

// ② オブジェクトな状態（スプレッド構文で不変更新）
function FormSection() {
  const [form, setForm] = useState({ name: '', email: '' });

  return (
    <Box>
      <Typography variant="h6">② フォーム（オブジェクト）</Typography>
      <Stack spacing={1} mt={1}>
        <TextField
          label="名前"
          size="small"
          value={form.name}
          // オブジェクトは丸ごと置き換え。変更しないフィールドも必ずスプレッドで引き継ぐ
          onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
        />
        <TextField
          label="Email"
          size="small"
          value={form.email}
          onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
        />
        <Typography variant="body2">値: {JSON.stringify(form)}</Typography>
      </Stack>
    </Box>
  );
}

// ③ 遅延初期化（重い計算の場合）
function LazyInitSection() {
  // 関数を渡すと初回レンダリング時だけ実行される（毎レンダリング実行されない）
  const [items] = useState<string[]>(() => {
    console.log('遅延初期化: 一度だけ実行される');
    return ['りんご', 'バナナ', 'みかん'];
  });

  return (
    <Box>
      <Typography variant="h6">③ 遅延初期化（関数渡し）</Typography>
      <Typography variant="body2">コンソールを確認: {items.join(', ')}</Typography>
    </Box>
  );
}

export function UseStateExample() {
  return (
    <Stack spacing={3}>
      <CounterSection />
      <FormSection />
      <LazyInitSection />
    </Stack>
  );
}
