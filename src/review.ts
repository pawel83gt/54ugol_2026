import { renderCartBadge } from './order-storage';
import emailjs from '@emailjs/browser';
import IMask from 'imask';

const EMAILJS_SERVICE_ID = 'service_mlra4te';
const EMAILJS_TEMPLATE_ID = 'template_7p0m1de';
const EMAILJS_PUBLIC_KEY = 'Wztp2Hn0s56d0e6w_';

export function initReview(): void {

    const form = document.querySelector<HTMLFormElement>('#review-form');
    const nameInput = document.querySelector<HTMLInputElement>('#review-name');
    const phoneInput = document.querySelector<HTMLInputElement>('#review-phone');
    const reviewText = document.querySelector<HTMLInputElement>('#review-text');
    const submitBtn = document.querySelector<HTMLButtonElement>('#review-submit');
    const statusEl = document.querySelector<HTMLElement>('#review-status');

    renderCartBadge();

    if (!form || !nameInput || !phoneInput || !reviewText || !submitBtn) return;

     const mask = IMask(phoneInput, {
        mask: '+{7} (000) 000-00-00',
        lazy: false
     })

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = nameInput.value.trim();
        const text = reviewText.value.trim();

        if (!name || !text) {
            if (statusEl) statusEl.textContent = 'Заполните имя и текст отзыва';
            return;
        }

        if(!mask.masked.isComplete) {
            if(statusEl) statusEl.textContent = 'Введите номер телефона полностью.'
        }

        const phone = mask.value;

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
                    review_text: text,
                },
                { publicKey: EMAILJS_PUBLIC_KEY }
            );


            form.hidden = true;
            if (statusEl) statusEl.textContent = 'Благодарим за ваш отзыв';
        } catch (err) {
            console.error('EmailJS error:', err);
            submitBtn.disabled = false;
            submitBtn.textContent = 'Отправить';
            if (statusEl) statusEl.textContent = 'Не получилось отправить, попробуйте ещё раз.';
        }
    })
}