/**
 * Задание 2: Типизация хуков и состояния
 *
 * Цель: Освоить типизацию useState, useEffect и простых кастомных хуков
 *
 * Инструкции:
 * 1. Добавьте правильную типизацию ко всем хукам
 * 2. Создайте простые типизированные кастомные хуки
 * 3. Обработайте основные состояния приложения
 */

import { useState, useEffect, useCallback } from "react";

// ===== ЗАДАЧА 2.1: Счетчик с расширенным состоянием =====

interface CounterState {
  count: number;
  step: number;
  isRunning: boolean;
  history: number[];
}

function Counter() {
  const [state, setState] = useState<CounterState>({
    count: 0,
    step: 1,
    isRunning: false,
    history: [],
  });

  const increment = () => {
    setState((prev) => ({
      ...prev,
      count: prev.count + prev.step,
      history: [...prev.history, prev.count + prev.step],
    }));
  };

  const decrement = () => {
    setState((prev) => ({
      ...prev,
      count: prev.count - prev.step,
      history: [...prev.history, prev.count - prev.step],
    }));
  };

  const setStep = (newStep: number) => {
    setState((prev) => ({
      ...prev,
      step: newStep,
    }));
  };

  const toggleRunning = () => {
    setState((prev) => ({
      ...prev,
      isRunning: !prev.isRunning,
    }));
  };

  const reset = () => {
    setState({
      count: 0,
      step: 1,
      isRunning: false,
      history: [],
    });
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (state.isRunning) {
      intervalId = setInterval(() => {
        increment();
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [state.isRunning]);

  return (
    <div className="counter">
      <h2>Счетчик: {state.count}</h2>
      <p>Шаг: {state.step}</p>

      <div className="controls">
        <button onClick={increment}>+</button>
        <button onClick={decrement}>-</button>
        <button onClick={toggleRunning}>
          {state.isRunning ? "Пауза" : "Старт"}
        </button>
        <button onClick={reset}>Сброс</button>
      </div>

      <div className="step-control">
        <label>
          Шаг:
          <input
            type="number"
            value={state.step}
            onChange={(e) => setStep(Number(e.target.value))}
            min="1"
          />
        </label>
      </div>

      <div className="history">
        <h3>История:</h3>
        <ul>
          {state.history.map((value, index) => (
            <li key={index}>{value}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ===== ЗАДАЧА 2.2: Простое todo приложение =====

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoText, setNewTodoText] = useState<string>("");

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodoText.trim()) {
      const newTodo: Todo = {
        id: Date.now().toString(),
        text: newTodoText.trim(),
        completed: false,
      };
      setTodos((prev) => [...prev, newTodo]);
      setNewTodoText("");
    }
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  const completedCount = todos.filter((todo) => todo.completed).length;

  return (
    <div className="todo-app">
      <h2>Todo приложение</h2>

      <form onSubmit={addTodo}>
        <input
          type="text"
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          placeholder="Добавить новую задачу..."
        />
        <button type="submit">Добавить</button>
      </form>

      <ul className="todo-list">
        {todos.map((todo) => (
          <li key={todo.id} className={todo.completed ? "completed" : ""}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span>{todo.text}</span>
            <button onClick={() => deleteTodo(todo.id)}>Удалить</button>
          </li>
        ))}
      </ul>

      <div className="stats">
        <p>Всего: {todos.length}</p>
        <p>Завершено: {completedCount}</p>
      </div>
    </div>
  );
}

// ===== ЗАДАЧА 2.3: Кастомные хуки =====

function useToggle(initialValue: boolean = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue((prev) => !prev);
  }, []);

  return [value, toggle] as const;
}

interface UseCounterReturn {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

function useCounter(initialValue: number = 0): UseCounterReturn {
  const [count, setCount] = useState(initialValue);

  const increment = useCallback(() => {
    setCount((prev) => prev + 1);
  }, []);

  const decrement = useCallback(() => {
    setCount((prev) => prev - 1);
  }, []);

  const reset = useCallback(() => {
    setCount(initialValue);
  }, [initialValue]);

  return {
    count,
    increment,
    decrement,
    reset,
  };
}

// ===== ЗАДАЧА 2.4: Демо компонент для кастомных хуков =====

function HooksDemo() {
  const { count, increment, decrement, reset } = useCounter(0);
  const [isVisible, toggleVisible] = useToggle(false);

  return (
    <div className="hooks-demo">
      <h2>Демо кастомных хуков</h2>

      <div className="demo-section">
        <h3>useCounter</h3>
        <p>Счетчик: {count}</p>
        <button onClick={increment}>+</button>
        <button onClick={decrement}>-</button>
        <button onClick={reset}>Сброс</button>
      </div>

      <div className="demo-section">
        <h3>useToggle</h3>
        <p>Состояние: {isVisible ? "Включено" : "Выключено"}</p>
        <button onClick={toggleVisible}>
          {isVisible ? "Выключить" : "Включить"}
        </button>
        {isVisible && <p>Элемент видим!</p>}
      </div>
    </div>
  );
}

// ===== ГЛАВНЫЙ КОМПОНЕНТ =====

const TABS = {
  counter: {
    text: "Счетчик",
    component: () => <Counter />,
  },
  todos: {
    text: "Todo",
    component: () => <TodoApp />,
  },
  hooks: {
    text: "Хуки",
    component: () => <HooksDemo />,
  },
};

function App() {
  const [activeTab, setActiveTab] = useState<keyof typeof TABS>("counter");

  return (
    <div className="app">
      <nav className="tabs">
        {Object.entries(TABS).map(([key, tab]) => (
          <button
            key={key}
            className={activeTab === key ? "active" : ""}
            onClick={() => setActiveTab(key as keyof typeof TABS)}
          >
            {tab.text}
          </button>
        ))}
      </nav>

      <div className="tab-content">{TABS[activeTab].component()}</div>
    </div>
  );
}

export default App;
