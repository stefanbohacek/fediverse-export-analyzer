import getPollOptions from './getPollOptions.min.js';
const pollElement = document.getElementById('poll');

const pollTypes = {
    'single-choice': 'radio',
    'multiple-choice': 'checkbox'
};

const renderPoll = (config) => {
    const {type, options, poll} = config;

    // console.log('renderPoll', {type, options, poll});

    if (poll){
        if (type && options){
            const pollOptionsHTML = options.map((option, index) => `
                        <div class="form-check">
                            <input
                                class="form-check-input"
                                type="${pollTypes[type]}"
                                name="poll-data-options"
                                id="poll-data-option-${index}"
                            >
                            <label
                                class="form-check-label text-break"
                                for="poll-data-option-${index}"
                            >
                                ${option}
                            </label>
                        </div>                        
                  `).join('');
        
            poll.innerHTML = pollOptionsHTML;
        } else {
            poll.innerHTML = `<p class="card-text fst-italic">${pollElement.dataset.placeholder}</p>`;
        }
    }
};

const pollOptionsElement = document.getElementById('poll-data-options');
const pollOptions = getPollOptions(pollOptionsElement);

renderPoll({
    poll: document.getElementById('poll'),
    type: document.getElementById('poll-data-type').value,
    options: pollOptions
});

export default renderPoll;
