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
          <button type="button" class="remove" data-name="${l.name}" aria-label="Убрать ${l.short}"><svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#000000" stroke-width="0.624"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <rect width="24" height="24" fill="none" stroke="none"></rect> <path d="M5 7.5H19L18 21H6L5 7.5Z" stroke="#d10000" stroke-linejoin="round"></path> <path d="M15.5 9.5L15 19" stroke="#d10000" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M12 9.5V19" stroke="#d10000" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M8.5 9.5L9 19" stroke="#d10000" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M16 5H19C20.1046 5 21 5.89543 21 7V7.5H3V7C3 5.89543 3.89543 5 5 5H8M16 5L15 3H9L8 5M16 5H8" stroke="#d10000" stroke-linejoin="round"></path> </g></svg>

</button>
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




