// Общий модуль: тип заказа и его сохранение между страницами (главная -> order.html)

export type OrderLine = { name: string; short: string; qty: number; unit: string; sum: number };
export type Order = { lines: OrderLine[]; total: number };

const STORAGE_KEY = 'order';

export function saveOrder(order: Order): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(order));
}

export function loadOrder(): Order {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { lines: [], total: 0 };

  try {
    const parsed = JSON.parse(raw) as Order;
    // Минимальная проверка формы данных, чтобы не упасть на битых/старых данных в localStorage
    if (!Array.isArray(parsed.lines) || typeof parsed.total !== 'number') {
      return { lines: [], total: 0 };
    }
    return parsed;
  } catch {
    return { lines: [], total: 0 };
  }
}

export function clearOrder(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function removeOrderLine(name: string): Order {
  const order = loadOrder();
  const lines = order.lines.filter((l) => l.name !== name);
  const total = lines.reduce((sum, l) => sum + l.sum, 0);
  const update: Order = { lines, total };
  saveOrder(update);
  return update;
}

export function renderCartBadge(): void {
  const order = loadOrder();
  const totalEl = document.querySelector<HTMLElement>('#total');
  const cartIcon = document.querySelector<HTMLElement>('#cart-icon');

  if (totalEl) totalEl.textContent = order.total.toLocaleString('ru-RU') + ' ₽';
  if (cartIcon) cartIcon.classList.toggle('active', order.lines.length > 0);
}
;
