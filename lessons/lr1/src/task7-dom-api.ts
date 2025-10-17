/*
 * ЗАДАЧА 7: Работа с DOM API и обработчиками событий
 *
 * Инструкции:
 * 1. Переименуйте файл в .ts
 * 2. Типизируйте все функции работы с DOM
 * 3. Правильно типизируйте Event handlers
 * 4. Используйте type guards для проверки элементов
 * 5. Обработайте случаи когда элементы могут не существовать
 */

// Система управления формой с валидацией

interface ValidationRule {
  validate: (value: string) => boolean;
  message: string;
}

interface FormField {
  name: string;
  element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
  validators: ValidationRule[];
  errorElement?: HTMLElement;
}

interface FormData {
  [fieldName: string]: string;
}

interface CreateElementOptions {
  id?: string;
  className?: string;
  textContent?: string;
  innerHTML?: string;
  attributes?: Record<string, string>;
  styles?: Partial<CSSStyleDeclaration>;
  parent?: HTMLElement;
}

// Утилита для безопасного получения элемента
function getElementById(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Элемент с ID "${id}" не найден`);
  }
  return element;
}

// Утилита для получения элемента определенного типа
function getElementByIdAsType<T extends HTMLElement>(
  id: string,
  expectedTag: string
): T {
  const element = getElementById(id);

  if (element.tagName.toLowerCase() !== expectedTag.toLowerCase()) {
    throw new Error(
      `Элемент "${id}" должен быть ${expectedTag}, но это ${element.tagName}`
    );
  }

  return element as T;
}

// Класс для управления формой
class FormManager {
  private form: HTMLFormElement;
  private fields: Map<string, FormField>;
  private errors: Map<string, string>;

  constructor(formId: string) {
    this.form = getElementByIdAsType<HTMLFormElement>(formId, "form");
    this.fields = new Map();
    this.errors = new Map();

    this.setupEventListeners();
  }

  addField(
    fieldName: string,
    fieldId: string,
    validators: ValidationRule[]
  ): FormManager {
    const element = getElementById(fieldId) as HTMLInputElement;
    const errorElement =
      document.getElementById(`${fieldId}-error`) || undefined;

    const field: FormField = {
      name: fieldName,
      element: element,
      validators: validators || [],
      errorElement: errorElement as HTMLElement,
    };

    this.fields.set(fieldName, field);

    element.addEventListener("input", (event: Event) => {
      this.validateField(fieldName, (event.target as HTMLInputElement).value);
    });

    element.addEventListener("blur", (event: Event) => {
      this.validateField(fieldName, (event.target as HTMLInputElement).value);
    });

    return this;
  }

  private setupEventListeners(): void {
    this.form.addEventListener("submit", (event: SubmitEvent) => {
      event.preventDefault();
      this.handleSubmit(event);
    });

    const resetButton = this.form.querySelector('button[type="reset"]');
    if (resetButton) {
      resetButton.addEventListener("click", (event: Event) => {
        this.handleReset(event);
      });
    }
  }

  validateField(fieldName: string, value: string): boolean {
    const field = this.fields.get(fieldName);
    if (!field) return true;

    this.clearFieldError(fieldName);

    for (const validator of field.validators) {
      if (!validator.validate(value)) {
        this.setFieldError(fieldName, validator.message);
        return false;
      }
    }

    return true;
  }

  private setFieldError(fieldName: string, message: string): void {
    const field = this.fields.get(fieldName);
    if (!field) return;

    this.errors.set(fieldName, message);
    field.element.classList.add("error");

    if (field.errorElement) {
      field.errorElement.textContent = message;
      field.errorElement.style.display = "block";
    }
  }

  private clearFieldError(fieldName: string): void {
    const field = this.fields.get(fieldName);
    if (!field) return;

    this.errors.delete(fieldName);
    field.element.classList.remove("error");

    if (field.errorElement) {
      field.errorElement.textContent = "";
      field.errorElement.style.display = "none";
    }
  }

  getFormData(): FormData {
    const formData: FormData = {};

    this.fields.forEach((field, fieldName) => {
      const element = field.element;

      if ("type" in element && element.type === "checkbox") {
        formData[fieldName] = (element as HTMLInputElement).checked.toString();
      } else if ("type" in element && element.type === "radio") {
        const radioGroup = this.form.querySelectorAll<HTMLInputElement>(
          `input[name="${element.name}"]`
        );
        const checked = Array.from(radioGroup).find((radio) => radio.checked);
        formData[fieldName] = checked ? checked.value : "";
      } else {
        formData[fieldName] = element.value;
      }
    });

    return formData;
  }

  private handleSubmit(_event: SubmitEvent): void {
    console.log("Отправка формы...");

    let isValid = true;
    this.fields.forEach((_field, fieldName) => {
      const fieldValue = this.getFieldValue(fieldName);
      if (!this.validateField(fieldName, fieldValue)) {
        isValid = false;
      }
    });

    if (isValid) {
      const formData = this.getFormData();
      this.onSubmitSuccess(formData);
    } else {
      this.onSubmitError();
    }
  }

  private getFieldValue(fieldName: string): string {
    const field = this.fields.get(fieldName);
    if (!field) return "";
    return field.element.value;
  }

  private handleReset(_event: Event): void {
    console.log("Сброс формы...");

    this.fields.forEach((_field, fieldName) => {
      this.clearFieldError(fieldName);
    });

    this.errors.clear();
  }

  onSubmitSuccess(formData: FormData): void {
    console.log("✅ Форма отправлена успешно:", formData);
    alert("Форма отправлена успешно!");
  }

  onSubmitError(): void {
    console.log("❌ Ошибки в форме");
    alert("Пожалуйста, исправьте ошибки в форме");
  }
}

// Фабрика валидаторов
const Validators = {
  required: (message?: string): ValidationRule => ({
    validate: (value: string) => value.trim().length > 0,
    message: message || "Поле обязательно для заполнения",
  }),

  minLength: (minLen: number, message?: string): ValidationRule => ({
    validate: (value: string) => value.length >= minLen,
    message: message || `Минимальная длина: ${minLen} символов`,
  }),

  email: (message?: string): ValidationRule => ({
    validate: (value: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    },
    message: message || "Введите корректный email",
  }),

  phone: (message?: string): ValidationRule => ({
    validate: (value: string) => {
      const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
      return phoneRegex.test(value);
    },
    message: message || "Введите корректный номер телефона",
  }),
};

function addClickListener(
  elementId: string,
  handler: (event: MouseEvent) => void
): HTMLElement {
  const element = getElementById(elementId);
  element.addEventListener("click", handler as EventListener);
  return element;
}

function addKeyboardListener(
  elementId: string,
  handler: (event: KeyboardEvent) => void,
  keyCode?: string
): HTMLElement {
  const element = getElementById(elementId);

  element.addEventListener("keydown", (event: Event) => {
    const keyboardEvent = event as KeyboardEvent;
    if (!keyCode || keyboardEvent.code === keyCode) {
      handler(keyboardEvent);
    }
  });

  return element;
}

function createElement(
  tagName: string,
  options: CreateElementOptions
): HTMLElement {
  const element = document.createElement(tagName);

  if (options.id) element.id = options.id;
  if (options.className) element.className = options.className;
  if (options.textContent) element.textContent = options.textContent;
  if (options.innerHTML) element.innerHTML = options.innerHTML;

  if (options.attributes) {
    Object.entries(options.attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  }

  if (options.styles) {
    Object.entries(options.styles).forEach(([property, value]) => {
      (element.style as any)[property] = value;
    });
  }

  if (options.parent) {
    options.parent.appendChild(element);
  }

  return element;
}

function initializeForm(): void {
  const formHTML = `
        <form id="registration-form">
            <div>
                <label for="name">Имя:</label>
                <input type="text" id="name" name="name" />
                <div id="name-error" class="error-message"></div>
            </div>
            
            <div>
                <label for="email">Email:</label>
                <input type="email" id="email" name="email" />
                <div id="email-error" class="error-message"></div>
            </div>
            
            <div>
                <label for="phone">Телефон:</label>
                <input type="tel" id="phone" name="phone" />
                <div id="phone-error" class="error-message"></div>
            </div>
            
            <button type="submit">Отправить</button>
            <button type="reset">Сбросить</button>
        </form>
    `;

  console.log("HTML для формы:", formHTML);
}

function demonstrateEventHandling(): void {
  console.log("=== Демонстрация типизации событий ===");

  const eventExamples: Record<string, string> = {
    click: "MouseEvent",
    keydown: "KeyboardEvent",
    input: "InputEvent",
    change: "Event",
    submit: "SubmitEvent",
    resize: "UIEvent",
    scroll: "Event",
  };

  Object.entries(eventExamples).forEach(([eventType, eventInterface]) => {
    console.log(`${eventType} -> ${eventInterface}`);
  });
}

demonstrateEventHandling();
initializeForm();
