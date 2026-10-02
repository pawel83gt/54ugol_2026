import { saveOrder, loadOrder, type OrderLine } from './order-storage';

const MAX_TONS = 99;

const fmt = (n: number): string => n.toLocaleString('ru-RU') + ' ₽';

export function initCart(): void {
  const rows = Array.from(
    document.querySelectorAll<HTMLElement>('#list .row, #coal-bags .row')
  );
  const checkout = document.querySelector<HTMLButtonElement>('#checkout');
  const totalEl = document.querySelector<HTMLElement>('#total');
  const cartIcon = document.querySelector<HTMLElement>('#cart-icon'); // необязательный
  const breakdownEl = document.querySelector<HTMLElement>('#breakdown'); // необязательный

  if (!checkout || !totalEl) return;

  // Текущее состояние заказа — нужно обработчику клика на "Оформить"
  let currentLines: OrderLine[] = [];
  let currentTotal = 0;

  const update = (): void => {
    let total = 0;
    const lines: OrderLine[] = [];

    rows.forEach((row) => {
      const output = row.querySelector<HTMLOutputElement>('output');
      const minus = row.querySelector<HTMLButtonElement>('[data-d="-1"]');
      const sum = row.querySelector<HTMLElement>('.sum');
      if (!output || !minus || !sum) return;

      const n = Number(output.textContent);
      const price = Number(row.dataset.price);
      const name = row.dataset.name ?? '';
      const unit = row.dataset.unit ?? 'т';

      minus.disabled = n === 0;
      sum.innerHTML = n ? `Сумма: <strong>${fmt(n * price)}</strong>` : '';

      if (n) {
        total += n * price;
        lines.push({ name, short: row.dataset.short ?? name, qty: n, unit, sum: n * price });
      }
    });

    totalEl.textContent = fmt(total);
    currentLines = lines;
    currentTotal = total;

    if (breakdownEl) {
      breakdownEl.innerHTML = lines
        .map((l) => `<li>${l.short}: ${l.qty} ${l.unit}, ${fmt(l.sum)}</li>`)
        .join('');
    }

    // Значок корзины "включается" только когда в заказе что-то есть
    if (cartIcon) {
      cartIcon.classList.toggle('active', lines.length > 0);
    }

    if (lines.length) {
      checkout.removeAttribute('aria-disabled');
    } else {
      checkout.setAttribute('aria-disabled', 'true');
    }
  };

  //восстановление данных из хранилища
  const restoreFromStorage = (): void => {
    const saved = loadOrder();
    rows.forEach((row) => {
      const output = row.querySelector<HTMLOutputElement>('output');
      if(!output) return;
      const match = saved.lines.find((l) => l.name === row.dataset.name);
      output.textContent = match ? String(match.qty) : '0';
    });
    update();
    saveOrder({ lines: currentLines, total: currentTotal });
  }

  rows.forEach((row) => {
    row.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-d]');
      const output = row.querySelector<HTMLOutputElement>('output');
      if (!btn || !output) return;

      const next = Number(output.textContent) + Number(btn.dataset.d);
      output.textContent = String(Math.min(MAX_TONS, Math.max(0, next)));
      update();
      saveOrder({ lines: currentLines, total: currentTotal });
    });
  });

  // Клик по "Оформить" сохраняет заказ и переходит на страницу с деталями
  checkout.addEventListener('click', () => {
    if (checkout.getAttribute('aria-disabled') === 'true') return;
    //saveOrder({ lines: currentLines, total: currentTotal });
    location.href = 'order.html';
  });

  restoreFromStorage()//обычная загрузка страницы
  //при возврате из bfcashe по кнопке назад
  window.addEventListener('pageshow', (e) => {
    if(e.persisted) restoreFromStorage();
  })

}
