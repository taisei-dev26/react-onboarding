/**
 * useCallback / useMemo の練習
 *
 * useCallback(fn, deps): 関数をメモ化。deps が変わらない限り同じ関数参照を返す
 * useMemo(fn, deps):     値をメモ化。deps が変わらない限り再計算しない
 *
 * 使いどころ:
 * - useCallback: React.memo でラップした子コンポーネントへ渡すコールバック
 * - useMemo:     重い計算結果のキャッシュ、参照同一性が必要なオブジェクト/配列
 *
 * 注意: 最適化コストがあるので乱用しない。計測して必要な箇所だけ使う。
 */

import { memo, useCallback, useMemo, useState } from 'react';
import { Box, Button, Chip, Stack, Typography } from '@mui/material';

// ① useCallback: 子コンポーネントへ渡す関数のメモ化

// React.memo でラップした子コンポーネント
// 親が再レンダリングされても、propsが変わらなければ再レンダリングしない
let childRenderCount = 0;
const ExpensiveChild = memo(({ onIncrement }: { onIncrement: () => void }) => {
  childRenderCount++;
  return (
    <Box sx={{ p: 1, border: '1px solid', borderRadius: 1 }}>
      <Typography variant="body2">
        ExpensiveChild レンダリング回数: {childRenderCount}
      </Typography>
      <Button size="small" onClick={onIncrement}>親のカウントを増やす</Button>
    </Box>
  );
});

function CallbackSection() {
  const [count, setCount] = useState(0);
  const [other, setOther] = useState(0);

  // useCallback なし: other が変わるたびに新しい関数が生成される → ExpensiveChild が再レンダリング
  // useCallback あり: count が変わった時だけ新しい関数を生成する
  const handleIncrement = useCallback(() => {
    setCount(c => c + 1);
  }, []); // count を使わず関数型更新なので依存なし

  return (
    <Box>
      <Typography variant="h6">① useCallback</Typography>
      <Stack spacing={1} mt={1}>
        <Typography>count: {count} / other: {other}</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={() => setOther(o => o + 1)}>
            other を変える（Childは再レンダリングしない）
          </Button>
        </Stack>
        <ExpensiveChild onIncrement={handleIncrement} />
      </Stack>
    </Box>
  );
}

// ② useMemo: 重い計算のキャッシュ

function isPrime(n: number): boolean {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
  return true;
}

function getPrimesUpTo(max: number): number[] {
  // わざと重い処理に見せるための素数計算
  return Array.from({ length: max }, (_, i) => i + 2).filter(isPrime);
}

function MemoSection() {
  const [limit, setLimit] = useState(100);
  const [unrelated, setUnrelated] = useState(0);

  // useMemo: limit が変わった時だけ再計算。unrelated が変わっても再計算しない
  const primes = useMemo(() => {
    console.log(`素数計算（limit=${limit}）`);
    return getPrimesUpTo(limit);
  }, [limit]);

  return (
    <Box>
      <Typography variant="h6">② useMemo（重い計算）</Typography>
      <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
        <Chip label={`limit: ${limit}`} />
        <Chip label={`素数の数: ${primes.length}`} />
        <Chip label={`unrelated: ${unrelated}`} />
      </Stack>
      <Stack direction="row" spacing={1} mt={1}>
        <Button variant="outlined" onClick={() => setLimit(l => l + 100)}>
          limit +100（再計算）
        </Button>
        <Button variant="outlined" onClick={() => setUnrelated(u => u + 1)}>
          unrelated を変える（再計算しない）
        </Button>
      </Stack>
      <Typography variant="caption">コンソールで再計算タイミングを確認</Typography>
    </Box>
  );
}

// ③ useMemo でオブジェクトの参照を安定させる
function StableReferenceSection() {
  const [name, setName] = useState('田中');
  const [count, setCount] = useState(0);

  // useMemo なし: レンダリングのたびに新しいオブジェクトが生成される
  // useMemo あり: name が変わった時だけ新しいオブジェクトを生成する
  const user = useMemo(() => ({ name, role: 'admin' }), [name]);

  return (
    <Box>
      <Typography variant="h6">③ useMemo で参照を安定化</Typography>
      <Typography variant="body2">user: {JSON.stringify(user)}</Typography>
      <Stack direction="row" spacing={1} mt={1}>
        <Button variant="outlined" onClick={() => setName(n => n + '!')}>name を変える</Button>
        <Button variant="outlined" onClick={() => setCount(c => c + 1)}>
          count: {count}（userは変わらない）
        </Button>
      </Stack>
    </Box>
  );
}

export function UseCallbackMemoExample() {
  return (
    <Stack spacing={3}>
      <CallbackSection />
      <MemoSection />
      <StableReferenceSection />
    </Stack>
  );
}
