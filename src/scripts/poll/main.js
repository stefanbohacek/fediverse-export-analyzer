import updatePreview from './updatePreview.min.js';

class Poll {
    constructor() {
        this.pollForm = document.getElementById('poll-data');
        this.pollPreview = document.getElementById('poll');
    }

    updatePreview(field){
        updatePreview(this.pollForm, this.pollPreview, field);
    }
}

const poll = new Poll();
export default poll;
