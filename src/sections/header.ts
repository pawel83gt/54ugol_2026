export function renderHeader(): string {
    return `
    <header class="top">
        <div class="wrap">
            <a class="brand" href="/">
                <img src="images/logo.png" alt="" width="46" height="46">
                <span><small>Новосибирская топливная корпорация</small><b>ОСП «Карасукский райтоп»</b></span>
             </a>
            <div class="contacts">
            <div>
                <a class="phone" href="tel:+73835533197">8 (383) 553-31-97</a>
                <span>пн–пт, с 9:00 до 17:00</span>
            </div>
            <div>
                <a href="mailto:karasuk@ntknso.ru">karasuk@ntknso.ru</a>
                <span>г. Карасук, ул. Дещенко, 45</span>
            </div>
            </div>
        </div>
    </header>
  `;
}