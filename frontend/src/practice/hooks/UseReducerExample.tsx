/**
 * useReducer の練習
 *
 * 基本: const [state, dispatch] = useReducer(reducer, initialState)
 * - reducer: (currentState, action) => nextState の純粋関数
 * - dispatch: action を reducer に渡してstateを更新する
 * - useState との使い分け:
 *   - 状態が複数フィールドで複雑に絡み合う場合
 *   - 次のstateが前のstateに依存する場合
 *   - Redux/Zustandと同じメンタルモデルで学べる
 */

import { useReducer } from 'react';
import { Box, Button, Chip, List, ListItem, ListItemText, Stack, TextField, Typography } from '@mui/material';

// ① アクションの型定義（Union type で網羅性チェック）
type Action =
  | { type: 'INCREMENT' }
  | { type: 'DECREMENT' }
  | { type: 'RESET' }
  | { type: 'SET'; payload: number };

// ② reducer: 純粋関数。同じ入力には必ず同じ出力
function counterReducer(state: number, action: Action): number {
  switch (action.type) {
    case 'INCREMENT': return state + 1;
    case 'DECREMENT': return state - 1;
    case 'RESET':     return 0;
    case 'SET':       return action.payload;
    // default はなくてよい（TypeScript が網羅チェックしてくれる）
  }
}

function CounterSection() {
  const [count, dispatch] = useReducer(counterReducer, 0);

  return (
    <Box>
      <Typography variant="h6">① カウンター</Typography>
      <Typography>count: {count}</Typography>
      <Stack direction="row" spacing={1} mt={1}>
        <Button variant="outlined" onClick={() => dispatch({ type: 'DECREMENT' })}>-</Button>
        <Button variant="outlined" onClick={() => dispatch({ type: 'RESET' })}>リセット</Button>
        <Button variant="outlined" onClick={() => dispatch({ type: 'INCREMENT' })}>+</Button>
        <Button variant="outlined" onClick={() => dispatch({ type: 'SET', payload: 100 })}>100に設定</Button>
      </Stack>
    </Box>
  );
}

// ③ 複雑な状態: TODOリスト
type Todo = { id: number; text: string; done: boolean };
type TodoState = { todos: Todo[]; nextId: number };
type TodoAction =
  | { type: 'ADD'; text: string }
  | { type: 'TOGGLE'; id: number }
  | { type: 'DELETE'; id: number };

function todoReducer(state: TodoState, action: TodoAction): TodoState {
  switch (action.type) {
    case 'ADD':
      return {
        todos: [...state.todos, { id: state.nextId, text: action.text, done: false }],
        nextId: state.nextId + 1,
      };
    case 'TOGGLE':
      return {
        ...state,
        todos: state.todos.map(t => t.id === action.id ? { ...t, done: !t.done } : t),
      };
    case 'DELETE':
      return { ...state, todos: state.todos.filter(t => t.id !== action.id) };
  }
}

function TodoSection() {
  const [{ todos }, dispatch] = useReducer(todoReducer, { todos: [], nextId: 1 });
  const [input, setInput] = useReducer(
    (_: string, val: string) => val, // 単純なsetterをreducerで表現することもできる
    ''
  );

  const handleAdd = () => {
    if (!input.trim()) return;
    dispatch({ type: 'ADD', text: input });
    setInput('');
  };

  return (
    <Box>
      <Typography variant="h6">② TODOリスト（複数フィールド）</Typography>
      <Stack direction="row" spacing={1} mt={1}>
        <TextField
          size="small"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="タスクを入力"
        />
        <Button variant="contained" onClick={handleAdd}>追加</Button>
      </Stack>
      <List dense>
        {todos.map(todo => (
          <ListItem
            key={todo.id}
            secondaryAction={
              <Chip label="削除" size="small" onClick={() => dispatch({ type: 'DELETE', id: todo.id })} />
            }
          >
            <ListItemText
              primary={todo.text}
              onClick={() => dispatch({ type: 'TOGGLE', id: todo.id })}
              sx={{ cursor: 'pointer', textDecoration: todo.done ? 'line-through' : 'none' }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

export function UseReducerExample() {
  return (
    <Stack spacing={3}>
      <CounterSection />
      <TodoSection />
    </Stack>
  );
}
