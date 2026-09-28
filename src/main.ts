import './style.css'
import { renderHeader } from './sections/header';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = 
renderHeader();



