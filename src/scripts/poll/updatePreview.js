import renderPoll from './renderPoll.min.js';
import getPollOptions from './getPollOptions.min.js';

const pollElement = document.getElementById('poll');
const pollTypeElement = document.getElementById('poll-data-type');
const pollOptionsElement = document.getElementById('poll-data-options');

const updatePreview = (pollForm, pollPreview, field) => {
    const pollPreviewTitle = document.getElementById('poll-title');
    const pollPreviewDescription = document.getElementById('poll-description');

    switch (field.id) {
        case 'poll-data-title':
            if (field.value && field.value.length){
                pollPreviewTitle.innerHTML = field.value.trim();
            } else {
                pollPreviewTitle.innerHTML = 'My poll';
            }
            break;
        case 'poll-data-description':
            if (field.value && field.value.length){
                const exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;

                pollPreviewDescription.innerHTML = field.value
                    .split('\n')
                    .map(p => `<p>${p.trim()}</p>`)
                    .join('')
                    .replace(exp, '<a href="$1" target="_blank">$1</a>');
            } else {
                pollPreviewDescription.innerHTML = 'Vote in my poll!';
            }
            break;
        case 'poll-data-options':
        case 'poll-data-type':
            renderPoll({
                poll: pollElement,
                type: pollTypeElement.value,
                options: getPollOptions(pollOptionsElement)
            });
            break;
        default:
            break;
    }
};

renderPoll({
    poll: pollElement,
    type: pollTypeElement.value,
    options: getPollOptions(pollOptionsElement)
});

export default updatePreview;
