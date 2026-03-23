/**
 * useContext の練習
 *
 * 基本: const value = useContext(MyContext)
 * - Provider でラップした範囲の全子孫コンポーネントが値を読める
 * - props drilling（バケツリレー）を解消する手段
 * - 値が変わると、useContext を呼んでいる全コンポーネントが再レンダリングされる
 *   → 頻繁に変わる値には不向き（その場合は Zustand などを使う）
 */

import { createContext, useContext, useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';

// ① Context の型定義と作成
type ThemeContextType = {
  theme: 'light' | 'dark';
  toggle: () => void;
};

// createContext に渡すのはデフォルト値（Provider 外で呼ばれた場合に使われる）
const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggle: () => {},
});

// ② カスタムhookでラップするのが定番パターン
function useTheme() {
  return useContext(ThemeContext);
}

// ③ 深い階層のコンポーネント（props を受け取っていない）
function DeepChild() {
  const { theme } = useTheme();
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 1,
        bgcolor: theme === 'dark' ? 'grey.800' : 'grey.100',
        color: theme === 'dark' ? 'common.white' : 'text.primary',
      }}
    >
      <Typography variant="body2">
        DeepChild: テーマは「{theme}」（props なしで値を取得）
      </Typography>
    </Box>
  );
}

function MiddleLayer() {
  // このコンポーネントはテーマを使わないが、DeepChild を描画する
  // useContext がなければここで props を中継する必要があった
  return (
    <Box sx={{ border: '1px dashed grey', p: 1, borderRadius: 1 }}>
      <Typography variant="caption">MiddleLayer（contextを使わない中間層）</Typography>
      <DeepChild />
    </Box>
  );
}

function ToggleButton() {
  const { theme, toggle } = useTheme();
  return (
    <Button variant="contained" onClick={toggle}>
      現在: {theme} → 切り替え
    </Button>
  );
}

// ④ Provider でラップして値を供給
export function UseContextExample() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const toggle = () => setTheme(t => (t === 'light' ? 'dark' : 'light'));

  return (
    // value が変わると Provider 内の useContext 使用コンポーネントが再レンダリング
    <ThemeContext.Provider value={{ theme, toggle }}>
      <Stack spacing={2}>
        <Typography variant="h6">useContext: テーマ共有</Typography>
        <ToggleButton />
        <MiddleLayer />
      </Stack>
    </ThemeContext.Provider>
  );
}
