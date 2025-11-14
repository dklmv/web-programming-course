/**
 * Задание 4: Современные паттерны React + TypeScript
 *
 * Цель: Освоить современные паттерны: Context + hooks, Custom hooks, Compound Components
 *
 * Инструкции:
 * 1. Создайте типизированные Context и хуки
 * 2. Реализуйте простые Compound Components
 * 3. Создайте custom hooks для переиспользования
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

// ===== ЗАДАЧА 4.1: Типизированные Context и хуки =====

interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user" | "guest";
}

interface UserContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isLoggedIn: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback((userData: User) => {
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const isLoggedIn = user !== null;

  const value: UserContextType = {
    user,
    login,
    logout,
    isLoggedIn,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

function useUser(): UserContextType {
  const context = useContext(UserContext);

  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }

  return context;
}

// ===== ЗАДАЧА 4.2: Простые Compound Components =====

interface CardProps {
  children: ReactNode;
  className?: string;
}

interface CardHeaderProps {
  children: ReactNode;
}

interface CardContentProps {
  children: ReactNode;
}

interface CardFooterProps {
  children: ReactNode;
}

function Card({ children, className }: CardProps) {
  return <div className={`card ${className || ""}`}>{children}</div>;
}

const CardHeader = ({ children }: CardHeaderProps) => {
  return <div className="card-header">{children}</div>;
};

const CardContent = ({ children }: CardContentProps) => {
  return <div className="card-content">{children}</div>;
};

const CardFooter = ({ children }: CardFooterProps) => {
  return <div className="card-footer">{children}</div>;
};

Card.Header = CardHeader;
Card.Content = CardContent;
Card.Footer = CardFooter;

// ===== ЗАДАЧА 4.3: Custom Hooks =====

function useCounter(initialValue = 0) {
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

  return { count, increment, decrement, reset };
}

function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue((prev) => !prev);
  }, []);

  return [value, toggle] as const;
}

// ===== ЗАДАЧА 4.4: Пример демо приложения =====

const Demo = () => {
  const { user, login, logout, isLoggedIn } = useUser();
  const { count, increment, decrement, reset } = useCounter(0);
  const [isVisible, toggleVisible] = useToggle(false);

  return (
    <div className="demo">
      <h1>Демо приложение</h1>

      <div className="user-section">
        <h2>Пользователь</h2>
        {isLoggedIn ? (
          <div>
            <p>Привет, {user?.name}!</p>
            <p>Email: {user?.email}</p>
            <p>Роль: {user?.role}</p>
            <button onClick={logout}>Выйти</button>
          </div>
        ) : (
          <button
            onClick={() =>
              login({
                id: 1,
                name: "Иван Иванов",
                email: "ivan@example.com",
                role: "user",
              })
            }
          >
            Войти
          </button>
        )}
      </div>

      <div className="counter-section">
        <h2>Счетчик: {count}</h2>
        <button onClick={increment}>+</button>
        <button onClick={decrement}>-</button>
        <button onClick={reset}>Сброс</button>
      </div>

      <div className="card-section">
        <Card className="demo-card">
          <Card.Header>
            <h3>Пример карточки</h3>
            <button onClick={toggleVisible}>
              {isVisible ? "Скрыть" : "Показать"}
            </button>
          </Card.Header>
          <Card.Content>
            {isVisible && <p>Содержимое карточки стало видимым!</p>}
          </Card.Content>
          <Card.Footer>
            <small>Подвал карточки</small>
          </Card.Footer>
        </Card>
      </div>
    </div>
  );
};

// ===== ГЛАВНЫЙ КОМПОНЕНТ =====

const App = () => {
  return (
    <UserProvider>
      <div className="app">
        <Demo />
      </div>
    </UserProvider>
  );
};

export default App;
