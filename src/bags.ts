import { saveOrder, loadOrder, type OrderLine } from './order-storage';

const MAX_TONS = 99;
const fmt = (n: number): string => n.toLocaleString('ru-RU') + ' ₽';

export function initCart(): void {
  //поиск элементов на странице
  const rows = Array.from(
    document.querySelectorAll<HTMLElement>('#list .row, #coal-bags .row')
  );//все строки товара
  const cartIcon = document.querySelector<HTMLButtonElement>('#cart-icon');//иконка корзины
  const totalEl = document.querySelector<HTMLElement>('#total');//итоговая сумма

  if (!cartIcon || !totalEl) return;

  // Для хранения текущего состояние заказа
  let currentLines: OrderLine[] = [];
  let currentTotal = 0;

  const update = (): void => {
    let total = 0; //общая сумма
    const lines: OrderLine[] = [];//список выбранных позиций

    //обходит все строки с товаром 
    //считывает данные по каждому товару
    //управляет кнопкой минус и выводит сумму в соответствии с ценой и колличеством товара
    //добавляет выбранный товар в общий список
    rows.forEach((row) => {
      const output = row.querySelector<HTMLOutputElement>('output');//значение количества
      const minus = row.querySelector<HTMLButtonElement>('[data-d="-1"]');//кнопка минус
      const sum = row.querySelector<HTMLElement>('.sum');//итоговая сумма за один товар
      if (!output || !minus || !sum) return;

      //считывание данных
      const n = Number(output.textContent);//сколько выбранно
      const price = Number(row.dataset.price);//цена за единицу берется из атрибута data-price
      const name = row.dataset.name ?? '';//полное название товара из атрибута data-name
      const unit = row.dataset.unit ?? 'т';//единица измерения по умолчанию в тоннах

      minus.disabled = n === 0;// если выбранно 0 товара тогда кнопка минус в режмие disabled
      sum.innerHTML = n ? `Сумма: <strong>${fmt(n * price)}</strong>` : '';//подсчет и вывод суммы в строчку

      //проверка если выбран товар то попадает в список, добавляется в общую сумму
      if (n) {
        total += n * price;
        lines.push({ name, short: row.dataset.short ?? name, qty: n, unit, sum: n * price });
      }
    });

    totalEl.textContent = fmt(total); //выводит итог на экран
    currentLines = lines;//сохранение списка позиций
    currentTotal = total;//сохранение общей суммы

    // Значок корзины "включается" только когда в заказе что-то есть. меняет цвет иконки корзина
    if (cartIcon) {
      cartIcon.classList.toggle('active', lines.length > 0);
    }

    //устанвливает доступность клика
    if (lines.length) {
      cartIcon.removeAttribute('aria-disabled');//убирает атрибут aria-disabled
    } else {
      cartIcon.setAttribute('aria-disabled', 'true');//возвращает атрибут клик не доступен
    }
  };

  //восстановление данных из хранилища
  const restoreFromStorage = (): void => {
    const saved = loadOrder(); //загрузка данных из хранилища
    rows.forEach((row) => {
      const output = row.querySelector<HTMLOutputElement>('output');
      if(!output) return; //если значение 0 то прерываем выполнение
      const match = saved.lines.find((l) => l.name === row.dataset.name); //записывает первый товар который совпал по имени
      output.textContent = match ? String(match.qty) : '0'; //восстанавливает колличество товара
    });
    update(); //после проставки количества делаем пересчет итоговой суммы и состояние корзины
    saveOrder({ lines: currentLines, total: currentTotal });//перезапись в хранилище
  }

  //установка обработчика событий при кликах + - через делегирование событий на всю строку
  rows.forEach((row) => {
    row.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-d]');//определяем кнопку по которй был клик
      const output = row.querySelector<HTMLOutputElement>('output');//находим значение количества в этой строке
      if (!btn || !output) return;

      const next = Number(output.textContent) + Number(btn.dataset.d);//вычисляем значение в зависимости от кнопки
      output.textContent = String(Math.min(MAX_TONS, Math.max(0, next)));//сначало найдем максимальное значение меньше 0 не может быть
      //затем минимальное, гарантированно вернет не больше MAX_TONS 99 и запишем в тэг output
      update();//делаем пересчет итоговой суммы и состояние корзины
      saveOrder({ lines: currentLines, total: currentTotal });//перезапись в хранилище
    });
  });

  // Клик по "Оформить" сохраняет заказ и переходит на страницу с деталями
  cartIcon.addEventListener('click', () => {
    if (cartIcon.getAttribute('aria-disabled') === 'true') return;
    //saveOrder({ lines: currentLines, total: currentTotal });
    location.href = 'order.html';
  });

  restoreFromStorage()//обычная загрузка страницы
  //при возврате из bfcashe по кнопке назад
  window.addEventListener('pageshow', (e) => {
    if(e.persisted) restoreFromStorage();
  })

}
