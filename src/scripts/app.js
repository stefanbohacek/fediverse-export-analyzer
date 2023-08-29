import onReady from './modules/onReady.min.js';
import Poll from '/js/poll/main.min.js';

onReady(() => {
    Poll.pollForm.addEventListener('submit', (ev) => {
        // ev.preventDefault();
    });

    Poll.pollForm.addEventListener('input', (event) => {
        const field = event.target;
        Poll.updatePreview(field);
    });
});
