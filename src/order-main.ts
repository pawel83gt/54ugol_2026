import './style.css';
import header from './sections/header.html?raw';
import orderContent from './sections/order-content.html?raw';
import footer from './sections/footer.html?raw';
import { initOrderPage } from './order';

document.querySelector('#order')!.innerHTML = header + orderContent + footer;

initOrderPage();