import './style.css'
import header from './sections/header.html?raw';
import hero  from './sections/hero.html?raw';
import products from './sections/products.html?raw';
import footer from './sections/footer.html?raw';
import { initCart } from './bags'
import { modalWindow } from './modal';

document.querySelector('#app')!.innerHTML = header + hero + products + footer;

initCart();
modalWindow();

