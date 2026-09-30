export function modalWindow(): void {
    const modal = document.getElementById('myModal') as HTMLDialogElement | null;;
    const openBtn = document.getElementById('openBtn') as HTMLButtonElement | null;
    const closeBtn = document.getElementById('closeBtn') as HTMLButtonElement | null;

    if (!modal || !openBtn || !closeBtn) return;
    
    // Открыть окно
    openBtn.addEventListener('click', () => {
        modal.showModal();
    });

    // Закрыть окно по кнопке
    closeBtn.addEventListener('click', () => {
        modal.close();
    });

    // Закрыть по клику на темный фон вне окна
    modal.addEventListener('click', (event: MouseEvent): void => {
        const rect = modal.getBoundingClientRect();
        const isOutside =
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom;

        if (isOutside) {
            modal.close();
        }
    });
}

// Вызов
modalWindow();