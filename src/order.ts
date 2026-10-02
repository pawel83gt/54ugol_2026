import emailjs from '@emailjs/browser';
import { loadOrder, clearOrder, removeOrderLine, type Order } from './order-storage';


const EMAILJS_SERVICE_ID = 'service_mlra4te';
const EMAILJS_TEMPLATE_ID = 'template_j6wqbpk';
const EMAILJS_PUBLIC_KEY = 'Wztp2Hn0s56d0e6w_';


const fmt = (n: number): string => n.toLocaleString('ru-RU') + ' ₽';


export function initOrderPage(): void {
  const breakdownEl = document.querySelector<HTMLElement>('#order-breakdown');
  const totalEl = document.querySelector<HTMLElement>('#order-total');
  const emptyEl = document.querySelector<HTMLElement>('#order-empty');
  const form = document.querySelector<HTMLFormElement>('#order-form');
  const nameInput = document.querySelector<HTMLInputElement>('#order-name');
  const phoneInput = document.querySelector<HTMLInputElement>('#order-phone');
  const submitBtn = document.querySelector<HTMLButtonElement>('#order-submit');
  const statusEl = document.querySelector<HTMLElement>('#order-status');


  if (!breakdownEl || !totalEl || !form || !nameInput || !phoneInput || !submitBtn) return;


  // --- Блок 1: отрисовка разбивки заказа (переиспользуется и при загрузке, и после удаления строки) ---
  function renderBreakdown(order: Order): void {
    breakdownEl!.innerHTML = order.lines
      .map(
        (l) => `
        <li>
          ${l.short}: ${l.qty} ${l.unit} — ${fmt(l.sum)}
          <button type="button" class="remove" data-name="${l.name}" aria-label="Убрать ${l.short}">×</button>
        </li>`
      )
      .join('');
    totalEl!.textContent = fmt(order.total);
  }


  // --- Блок 2: показать состояние "корзина пуста" (переиспользуется при старте и после удаления последней строки) ---
  function showEmptyState(): void {
    breakdownEl!.innerHTML = '';
    totalEl!.textContent = fmt(0);
    form!.hidden = true;
    if (emptyEl) emptyEl.hidden = false;
  }


  // --- Блок 3: первая загрузка страницы ---
  const order = loadOrder();


  if (!order.lines.length) {
    showEmptyState();
    return; // дальше обработчики вешать незачем, товаров нет
  }


  renderBreakdown(order);


  // --- Блок 4: удаление отдельной позиции (делегирование клика на весь список) ---
  breakdownEl.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('button.remove');
    if (!btn || !btn.dataset.name) return;


    const updated = removeOrderLine(btn.dataset.name);


    if (!updated.lines.length) {
      showEmptyState();
      return;
    }


    renderBreakdown(updated);
  });


  // --- Блок 5: отправка формы ---
  form.addEventListener('submit', async (e) => {
    e.preventDefault();


    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();


    if (!name || !phone) {
      if (statusEl) statusEl.textContent = 'Укажите имя и телефон.';
      return;
    }


    // Заказ мог измениться (удаление строк) — берём актуальные данные из хранилища, а не из order выше
    const current = loadOrder();
    const orderText = current.lines
      .map((l) => `${l.name} — ${l.qty} ${l.unit} = ${l.sum} ₽`)
      .join('\n');


    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправляем...';
    if (statusEl) statusEl.textContent = '';


    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          customer_name: name,
          customer_phone: phone,
          order_text: orderText,
          total: `${current.total} ₽`,
        },
        { publicKey: EMAILJS_PUBLIC_KEY }
      );


      clearOrder();
      form.hidden = true;
      breakdownEl.innerHTML = '';
      totalEl.textContent = fmt(0);
      if (statusEl) statusEl.textContent = 'Заявка отправлена, мы скоро свяжемся с вами.';
    } catch (err) {
      console.error('EmailJS error:', err);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Отправить';
      if (statusEl) statusEl.textContent = 'Не получилось отправить, попробуйте ещё раз.';
    }
  });
}




