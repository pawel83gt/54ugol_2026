import './style.css';
import header from './sections/header.html?raw';
import reviewPage from './sections/review-page.html?raw';
import footer from './sections/footer.html?raw';
import { initReview } from './review'

document.querySelector('#review')!.innerHTML = header + reviewPage + footer;

initReview();