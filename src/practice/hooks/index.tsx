/**
 * React Hooks 練習ページ
 *
 * 各hookのサンプルをタブで切り替えて確認できる。
 * App.tsx の Route に追加すると /practice/hooks でアクセス可能になる。
 *
 * 追加方法（App.tsx）:
 *   import { HooksPracticePage } from './practice/hooks';
 *   <Route path="/practice/hooks" component={HooksPracticePage} />
 */

import { useState } from 'react';
import { Box, Container, Divider, Paper, Tab, Tabs, Typography } from '@mui/material';
import { UseStateExample } from './UseStateExample';
import { UseEffectExample } from './UseEffectExample';
import { UseContextExample } from './UseContextExample';
import { UseReducerExample } from './UseReducerExample';
import { UseCallbackMemoExample } from './UseCallbackMemoExample';
import { UseRefExample } from './UseRefExample';

const HOOKS = [
  {
    label: 'useState',
    description: '状態を保持し、変更時に再レンダリングを起こす',
    component: <UseStateExample />,
  },
  {
    label: 'useEffect',
    description: 'レンダリング後に副作用を実行する（データ取得、タイマーなど）',
    component: <UseEffectExample />,
  },
  {
    label: 'useContext',
    description: 'props drilling なしに値をツリー全体へ共有する',
    component: <UseContextExample />,
  },
  {
    label: 'useReducer',
    description: '複雑な状態を reducer + action パターンで管理する',
    component: <UseReducerExample />,
  },
  {
    label: 'useCallback / useMemo',
    description: '関数・値をメモ化して不要な再計算・再レンダリングを防ぐ',
    component: <UseCallbackMemoExample />,
  },
  {
    label: 'useRef',
    description: 'DOM参照 / 再レンダリングなしに値を保持する',
    component: <UseRefExample />,
  },
] as const;

export function HooksPracticePage() {
  const [tab, setTab] = useState(0);
  const current = HOOKS[tab];

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>React Hooks 練習</Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        React 17 の標準 hooks を動かして確認しよう
      </Typography>

      <Paper elevation={2} sx={{ mt: 3 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {HOOKS.map(h => <Tab key={h.label} label={h.label} />)}
        </Tabs>

        <Divider />

        <Box sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold">{current.label}</Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            {current.description}
          </Typography>
          {current.component}
        </Box>
      </Paper>
    </Container>
  );
}
