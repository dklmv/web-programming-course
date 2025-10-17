/*
 * ЗАДАЧА 6: Решение типовых проблем типизации
 *
 * Инструкции:
 * 1. Переименуйте файл в .ts
 * 2. Исправьте все проблемы с типизацией
 * 3. Используйте type guards, utility types и другие продвинутые возможности
 * 4. Добавьте proper обработку ошибок и edge cases
 */

// Проблемные функции, которые нужно исправить

// ПРОБЛЕМА 1: Функция с any типом
function processData<T extends object>(
  data: T[] | T | string | number
): string[] {
  if (Array.isArray(data)) {
    return data.map((item) => item.toString());
  }

  if (typeof data === "object" && data !== null) {
    return Object.keys(data).map((key) => {
      const key1 = key as keyof T;
      return `${key}: ${data[key1]}`;
    });
  }

  return [data?.toString() || "null"];
}

// ПРОБЛЕМА 2: Функция с неопределенными возвращаемыми типами
function getValue<T>(obj: T, path: string): unknown {
  const keys = path.split(".");
  let current: any = obj;

  for (const key of keys) {
    if (current && typeof current === "object" && key in current) {
      current = current[key];
    } else {
      return undefined;
    }
  }

  return current;
}

// ПРОБЛЕМА 3: Функция с проблемами null/undefined
interface User {
  firstName?: string;
  lastName?: string;
  email?: string;
  age?: number;
  avatar?: string;
}

interface FormattedUser {
  fullName: string;
  email: string;
  age: string | number;
  avatar: string;
}

function formatUser(user: User): FormattedUser {
  return {
    fullName:
      `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Не указано",
    email: (user.email || "").toLowerCase(),
    age: user.age || "Не указан",
    avatar: user.avatar || "/default-avatar.png",
  };
}

// ПРОБЛЕМА 4: Функция с union типами без type guards
interface SuccessResponse<T> {
  success: true;
  data: T;
  error?: never;
}

interface ErrorResponse {
  success: false;
  data?: never;
  error: string;
}

type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

function handleResponse<T>(response: ApiResponse<T>): T {
  if (response.success) {
    console.log("Данные:", response.data);
    return response.data;
  } else {
    console.error("Ошибка:", response.error);
    throw new Error(response.error);
  }
}

// ПРОБЛЕМА 5: Функция с проблемами мутации
function updateArray<T>(arr: T[], index: number, newValue: T): T[] {
  if (index >= 0 && index < arr.length) {
    const newArray = [...arr];
    newArray[index] = newValue;
    return newArray;
  }
  return [...arr];
}

// ПРОБЛЕМА 6: Класс с неправильной типизацией событий
type EventCallback = (...args: any[]) => void;

class EventEmitter {
  private listeners: Record<string, EventCallback[]> = {};

  on(event: string, callback: EventCallback): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  emit(event: string, ...args: any[]): void {
    if (this.listeners[event]) {
      this.listeners[event].forEach((callback) => callback(...args));
    }
  }

  off(event: string, callback: EventCallback): void {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(
        (cb) => cb !== callback
      );
    }
  }
}

// ПРОБЛЕМА 7: Функция с проблемами асинхронности
async function fetchWithRetry<T>(
  url: string,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return (await response.json()) as T;
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }

  throw lastError!;
}

// ПРОБЛЕМА 8: Функция валидации с проблемами типов
interface ValidationRule {
  required?: boolean;
  minLength?: number;
  pattern?: RegExp;
  message?: string;
}

interface ValidationRules {
  [field: string]: ValidationRule;
}

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

function validateForm(
  formData: Record<string, string>,
  rules: ValidationRules
): ValidationResult {
  const errors: Record<string, string> = {};

  for (const field in rules) {
    const value = formData[field];
    const rule = rules[field];

    if (rule.required && (!value || value.trim() === "")) {
      errors[field] = "Поле обязательно для заполнения";
      continue;
    }

    if (value && rule.minLength && value.length < rule.minLength) {
      errors[field] = `Минимальная длина: ${rule.minLength} символов`;
      continue;
    }

    if (value && rule.pattern && !rule.pattern.test(value)) {
      errors[field] = rule.message || "Неверный формат";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// ПРОБЛЕМА 9: Утилитарная функция с проблемами типов
function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}

// ПРОБЛЕМА 10: Функция сравнения с проблемами типов
function isEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;

  if (a == null || b == null) return a === b;

  if (typeof a !== typeof b) return false;

  if (typeof a === "object" && a !== null && b !== null) {
    const keysA = Object.keys(a as object);
    const keysB = Object.keys(b as object);

    if (keysA.length !== keysB.length) return false;

    return keysA.every((key) => isEqual((a as any)[key], (b as any)[key]));
  }

  return false;
}

// Примеры использования (должны работать после исправления типизации)
console.log("=== Тестирование processData ===");
console.log(processData([1, 2, 3]));
console.log(processData({ a: 1, b: 2 }));
console.log(processData("hello"));

console.log("\n=== Тестирование getValue ===");
const testObj = { user: { profile: { name: "Анна" } } };
console.log(getValue(testObj, "user.profile.name"));
console.log(getValue(testObj, "user.nonexistent"));

console.log("\n=== Тестирование EventEmitter ===");
const emitter = new EventEmitter();
emitter.on("test", (message) => console.log("Получено:", message));
emitter.emit("test", "Привет!");

console.log("\n=== Тестирование pick ===");
const user = {
  name: "Анна",
  age: 25,
  email: "anna@example.com",
  password: "secret",
};
const publicData = pick(user, ["name", "age", "email"] as const);
console.log("Публичные данные:", publicData);
