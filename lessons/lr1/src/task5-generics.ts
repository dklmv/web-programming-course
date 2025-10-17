/*
 * ЗАДАЧА 5: Практика с Generics
 *
 * Инструкции:
 * 1. Переименуйте файл в .ts
 * 2. Добавьте generic типы ко всем функциям где это необходимо
 * 3. Создайте типизированные интерфейсы и классы
 * 4. Используйте ограничения generics (constraints)
 */

// Универсальные utility функции и классы

// TODO: Типизировать с использованием generics

// Утилита для кеширования
class Cache<T, U> {
  private cache: Map<T, U>;

  constructor() {
    this.cache = new Map();
  }

  set(key: T, value: U): void {
    this.cache.set(key, value);
  }

  get(key: T): U | undefined {
    return this.cache.get(key);
  }

  has(key: T): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: T): boolean {
    return this.cache.delete(key);
  }

  getSize(): number {
    return this.cache.size;
  }
}

// Универсальная функция фильтрации
function filterArray<T>(array: T[], predicate: (item: T) => boolean): T[] {
  return array.filter(predicate);
}

// Универсальная функция маппинга
function mapArray<T, U>(array: T[], mapper: (item: T) => U): U[] {
  return array.map(mapper);
}

// Функция для получения первого элемента
function getFirst<T>(array: T[]): T | undefined {
  return array.length > 0 ? array[0] : undefined;
}

// Функция для получения последнего элемента
function getLast<T>(array: T[]): T | undefined {
  return array.length > 0 ? array[array.length - 1] : undefined;
}

// Функция группировки по ключу
function groupBy<T, K extends string | number | symbol>(
  array: T[],
  keyGetter: (item: T) => K
): Record<K, T[]> {
  const groups = {} as Record<K, T[]>;

  array.forEach((item) => {
    const key = keyGetter(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
  });

  return groups;
}

// Функция для создания уникального массива
function unique<T, K>(array: T[], keyGetter?: (item: T) => K): T[] {
  if (!keyGetter) {
    return [...new Set(array)];
  }

  const seen = new Set<K>();
  return array.filter((item) => {
    const key = keyGetter(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

// Функция сортировки с кастомным компаратором
function sortBy<T>(array: T[], compareFn: (a: T, b: T) => number): T[] {
  return [...array].sort(compareFn);
}

// Класс для работы с коллекцией
class Collection<T> {
  items: T[];

  constructor(items: T[] = []) {
    this.items = items;
  }

  add(item: T): Collection<T> {
    this.items.push(item);
    return this;
  }

  remove(predicate: (item: T) => boolean): Collection<T> {
    this.items = this.items.filter((item) => !predicate(item));
    return this;
  }

  find(predicate: (item: T) => boolean): T | undefined {
    return this.items.find(predicate);
  }

  filter(predicate: (item: T) => boolean): Collection<T> {
    return new Collection(this.items.filter(predicate));
  }

  map<U>(mapper: (item: T) => U): Collection<U> {
    return new Collection(this.items.map(mapper));
  }

  reduce<U>(
    reducer: (
      accumulator: U,
      currentValue: T,
      currentIndex: number,
      array: T[]
    ) => U,
    initialValue: U
  ): U {
    return this.items.reduce(reducer, initialValue);
  }

  toArray(): T[] {
    return [...this.items];
  }

  get length(): number {
    return this.items.length;
  }
}

interface Entity {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

// Класс Repository для работы с данными
class Repository<T extends Entity, U extends Omit<T, keyof Entity>> {
  items: T[];
  nextId: number;

  constructor() {
    this.items = [];
    this.nextId = 1;
  }

  create(data: U): T {
    const item = {
      id: this.nextId++,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as T;
    this.items.push(item);
    return item;
  }

  findById(id: number): T | undefined {
    return this.items.find((item) => item.id === id);
  }

  findAll(): T[] {
    return [...this.items];
  }

  update(id: number, updates: Partial<U>): T | null {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) return null;

    this.items[index] = {
      ...this.items[index],
      ...updates,
      updatedAt: new Date(),
    };

    return this.items[index];
  }

  delete(id: number): boolean {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) return false;

    this.items.splice(index, 1);
    return true;
  }

  count(): number {
    return this.items.length;
  }
}

// Функция для объединения объектов
function merge<T extends object>(target: T, ...sources: Partial<T>[]): T {
  return Object.assign({}, target, ...sources);
}

// Функция для deep clone
function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => deepClone(item)) as T;
  }

  const cloned = {} as T;
  Object.keys(obj).forEach((key) => {
    cloned[key as keyof T] = deepClone(obj[key as keyof T]);
  });

  return cloned;
}

// Примеры использования
console.log("=== Тестирование Cache ===");
const cache = new Cache<string, { name: string; age: number }>();
cache.set("user:1", { name: "Анна", age: 25 });
console.log("Получили из кеша:", cache.get("user:1"));

console.log("\n=== Тестирование фильтрации и маппинга ===");
const numbers = [1, 2, 3, 4, 5];
const evenNumbers = filterArray(numbers, (n) => n % 2 === 0);
const doubled = mapArray(numbers, (n) => n * 2);
console.log("Четные числа:", evenNumbers);
console.log("Удвоенные:", doubled);

console.log("\n=== Тестирование Collection ===");
const users = new Collection([
  { name: "Анна", age: 25 },
  { name: "Петр", age: 30 },
  { name: "Мария", age: 22 },
]);

const adults = users.filter((user) => user.age >= 25);
const names = users.map((user) => user.name);
console.log("Взрослые:", adults.toArray());
console.log("Имена:", names.toArray());

console.log("\n=== Тестирование Repository ===");
interface UserEntity extends Entity {
  name: string;
  email: string;
}

const userRepo = new Repository<UserEntity, { name: string; email: string }>();
const newUser = userRepo.create({ name: "Анна", email: "anna@example.com" });
console.log("Создан пользователь:", newUser);
console.log("Всего пользователей:", userRepo.count());
