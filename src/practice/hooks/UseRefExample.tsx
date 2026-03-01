/**
 * useRef の練習
 *
 * 基本: const ref = useRef(initialValue)
 * - ref.current で値を読み書きできる
 * - 値を変えても再レンダリングが起きない（useState との最大の違い）
 *
 * 主な用途:
 * ① DOM要素への参照（フォーカス、サイズ取得、アニメーション）
 * ② レンダリングをまたいで値を保持（タイマーID、前回値など）
 * ③ 最新値への参照（クロージャ問題の回避）
 */

import { useEffect, useRef, useState } from 'react';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';

// ① DOM への参照
function DomRefSection() {
  const inputRef = useRef<HTMLInputElement>(null);

  const focusInput = () => {
    // ref.current は DOM ノード。null チェックが必要
    inputRef.current?.focus();
  };

  return (
    <Box>
      <Typography variant="h6">① DOM参照（フォーカス）</Typography>
      <Stack direction="row" spacing={1} mt={1} alignItems="center">
        <TextField
          inputRef={inputRef}
          size="small"
          placeholder="ボタンでフォーカス"
        />
        <Button variant="outlined" onClick={focusInput}>フォーカス</Button>
      </Stack>
    </Box>
  );
}

// ② レンダリングをまたぐ値の保持（タイマーIDの保存）
function TimerRefSection() {
  const [seconds, setSeconds] = useState(0);
  // タイマーIDをstateで管理すると、変更のたびに再レンダリングが起きる
  // useRef なら再レンダリングなしに保持できる
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const start = () => {
    if (intervalRef.current) return; // 二重起動防止
    intervalRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
  };

  const stop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // アンマウント時のクリーンアップ
  useEffect(() => () => stop(), []);

  return (
    <Box>
      <Typography variant="h6">② タイマーID保持（再レンダリングなし）</Typography>
      <Typography>{seconds}秒</Typography>
      <Stack direction="row" spacing={1} mt={1}>
        <Button variant="outlined" onClick={start}>START</Button>
        <Button variant="outlined" onClick={stop}>STOP</Button>
        <Button variant="outlined" onClick={() => { stop(); setSeconds(0); }}>RESET</Button>
      </Stack>
    </Box>
  );
}

// ③ 最新値への参照（クロージャ問題の回避）
function LatestValueSection() {
  const [count, setCount] = useState(0);
  // countRef は常に最新の count を指す
  const countRef = useRef(count);
  countRef.current = count; // 毎レンダリング時に最新値で更新

  const alertAfter3s = () => {
    setTimeout(() => {
      // クロージャなら古い count が見える。ref なら最新の値が見える
      alert(`3秒後の count: ${countRef.current} (refで最新値を参照)`);
    }, 3000);
  };

  return (
    <Box>
      <Typography variant="h6">③ 最新値参照（クロージャ問題の回避）</Typography>
      <Typography>count: {count}</Typography>
      <Stack direction="row" spacing={1} mt={1}>
        <Button variant="outlined" onClick={() => setCount(c => c + 1)}>+1</Button>
        <Button variant="outlined" onClick={alertAfter3s}>
          3秒後にalert（増やしてみて）
        </Button>
      </Stack>
    </Box>
  );
}

// ④ 前回値の保持
function PreviousValueSection() {
  const [value, setValue] = useState(0);
  const prevValueRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    // レンダリング後に前回値を更新
    prevValueRef.current = value;
  });

  return (
    <Box>
      <Typography variant="h6">④ 前回値の保持</Typography>
      <Typography>現在: {value} / 前回: {prevValueRef.current ?? '(なし)'}</Typography>
      <Button variant="outlined" sx={{ mt: 1 }} onClick={() => setValue(v => v + 1)}>+1</Button>
    </Box>
  );
}

export function UseRefExample() {
  return (
    <Stack spacing={3}>
      <DomRefSection />
      <TimerRefSection />
      <LatestValueSection />
      <PreviousValueSection />
    </Stack>
  );
}
