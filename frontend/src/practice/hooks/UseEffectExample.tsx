/**
 * useEffect の練習
 *
 * 基本: useEffect(setup, dependencies?)
 * - setup: 副作用の処理（データ取得、タイマー、DOM操作など）
 * - dependencies: 依存配列。変化した時だけsetupを再実行する
 *   - 省略     → 毎レンダリング後に実行
 *   - []       → マウント時のみ実行
 *   - [a, b]   → a か b が変わった時に実行
 * - setup が関数を返すとクリーンアップ関数になる（アンマウント時に実行）
 */

import { useEffect, useState } from 'react';
import { Box, Chip, Stack, TextField, Typography } from '@mui/material';

// ① マウント時のみ実行（データ取得の模倣）
function MountOnlySection() {
  const [data, setData] = useState<string | null>(null);

  useEffect(() => {
    // [] = マウント時のみ。コンポーネントが表示された瞬間に1回だけ実行
    const timer = setTimeout(() => setData('ロード完了！'), 1000);
    // クリーンアップ: アンマウント時にタイマーをキャンセル（メモリリーク防止）
    return () => clearTimeout(timer);
  }, []);

  return (
    <Box>
      <Typography variant="h6">① マウント時のみ（[]）</Typography>
      <Typography>{data ?? '読み込み中...'}</Typography>
    </Box>
  );
}

// ② 依存値が変わった時に実行
function DependencySection() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState('');
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!query) {
      setResult('');
      setSearching(false);
      return;
    }
    // 入力直後: 「検索中...」を表示
    setSearching(true);
    const timer = setTimeout(() => {
      // 300ms 後: 結果を表示
      setResult(`「${query}」で検索（デバウンス300ms）`);
      setSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <Box>
      <Typography variant="h6">② 依存配列 [query]</Typography>
      <TextField
        label="検索"
        size="small"
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      <Typography variant="body2" mt={1} color={searching ? 'text.secondary' : 'text.primary'}>
        {searching ? '検索中...' : result || '入力してください'}
      </Typography>
    </Box>
  );
}

// ③ クリーンアップの確認（タイマー）
function TimerSection() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds(s => s + 1), 1000);
    // stopを押したとき（running が false になったとき）にインターバルを止める
    return () => clearInterval(id);
  }, [running]); // running が変わるたびに再実行 → 前のintervalがクリーンアップされる

  return (
    <Box>
      <Typography variant="h6">③ クリーンアップ（インターバル）</Typography>
      <Stack direction="row" spacing={1} alignItems="center" mt={1}>
        <Chip label={`${seconds}秒`} />
        <Chip
          label={running ? 'STOP' : 'START'}
          color={running ? 'error' : 'success'}
          onClick={() => setRunning(r => !r)}
          clickable
        />
        <Chip label="リセット" onClick={() => { setRunning(false); setSeconds(0); }} clickable />
      </Stack>
    </Box>
  );
}

export function UseEffectExample() {
  return (
    <Stack spacing={3}>
      <MountOnlySection />
      <DependencySection />
      <TimerSection />
    </Stack>
  );
}
