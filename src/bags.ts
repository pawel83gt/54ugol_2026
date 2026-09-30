const MAX_TONS = 99;
const ORDER_EMAIL = 'karasuk@ntknso.ru';

const fmt = (n: number): string => n.toLocaleString('ru-RU') + ' ₽'; //функция форматирует число в строку с валютой

type OrderLine = { name: string; short: string; qty: number; unit: string; sum: number };

export function initCart(): void {

  const rows = Array.from(document.querySelectorAll<HTMLElement>('#list .row, #coal-bags .row'));
  const send = document.querySelector<HTMLAnchorElement>('#send');
  const totalEl = document.querySelector<HTMLElement>('#total');
  const breakdownEl = document.querySelector<HTMLElement>('#breakdown');
  if (!send || !totalEl) return;

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
        lines.push({ name, short: row.dataset.short ?? name, qty: n, unit, sum: n * price })
      }
    });

    totalEl.textContent = fmt(total);

    //разбивка по маркам 
    if (breakdownEl) {
      breakdownEl.innerHTML = lines
        .map((l) => `<li>${l.short}: ${l.qty} ${l.unit}, ${fmt(l.sum)}</li>`)
        .join('');
    }

    if (lines.length) {
      const body =
        `Здравствуйте! Хочу заказать:\n\n` +
        lines.map((l) => `${l.name} - ${l.qty} ${l.unit} = ${l.sum} ₽`).join('\n') + 
        `\n\nИтого: ${total} ₽\n\nИмя и телефон: `;
      send.href =
        `mailto:${ORDER_EMAIL}?subject=${encodeURIComponent('Заказ угля')}` +
        `&body=${encodeURIComponent(body)}`;
      send.setAttribute('aria-disabled', 'false');
    } else {
      send.removeAttribute('href');
      send.setAttribute('aria-disabled', 'true');
    }
  };

  rows.forEach((row) => {
    row.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-d]');
      const output = row.querySelector<HTMLOutputElement>('output');
      if (!btn || !output) return;

      const next = Number(output.textContent) + Number(btn.dataset.d);
      output.textContent = String(Math.min(MAX_TONS, Math.max(0, next)));
      update();
    });
  });

  update();
}