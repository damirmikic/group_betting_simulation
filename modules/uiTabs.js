export function initializeTabSwitching() {
    document.addEventListener('DOMContentLoaded', () => {
        const buttons = document.querySelectorAll('.tab-button[data-tab]');
        const contents = document.querySelectorAll('.tab-content');

        function activateTab(tabId) {
            contents.forEach(el => {
                el.style.display = 'none';
                el.classList.remove('active');
            });
            buttons.forEach(btn => btn.classList.remove('active'));

            const target = document.getElementById(tabId);
            if (target) {
                target.style.display = 'block';
                target.classList.add('active');
            }
            const btn = document.querySelector(`.tab-button[data-tab="${tabId}"]`);
            if (btn) btn.classList.add('active');
        }

        buttons.forEach(btn => {
            btn.addEventListener('click', () => activateTab(btn.dataset.tab));
        });

        // Activate first tab on load
        if (buttons.length > 0) activateTab(buttons[0].dataset.tab);
    });
}
