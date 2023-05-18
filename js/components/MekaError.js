import MekaPonent from "./MekaPonent.js";

class MekaError extends MekaPonent {
    constructor() {
        super();
        const wrapper = document.createElement('div');
        this.shadowRoot.appendChild(wrapper);
        chrome.storage.onChanged.addListener((changes) => {
            const { errorMessage } = changes;
            if (errorMessage) {
                this.setAttribute('message', errorMessage);
            } else {
                this.setAttribute('message', '');
            }
        });
        chrome.storage.sync.get({errorMessage: ''}, ({errorMessage}) => {
            this.setAttribute('message', errorMessage);
            this.render();
        });
        
    }

    get message() {
        return this.getAttribute('message');
    }

    set message(msg) {
        this.setAttribute('message', msg);
    }

    attributeChangedCallback(_name, _oldValue, _newValue) {
        this.render();
    }

    render() {
        if (this.getAttribute('message')) {
            this.query('div').innerHTML = /* html */`
                <style>
                    span {
                        background-color: #a33;
                        display:block;
                        padding: 10px;
                        margin: 10px 0;
                        border: solid 1px #eaeaea;
                    }
                </style>
                <span>${this.getAttribute('message')}</span>
            `;
        } else {
            this.query('div').innerHTML = '';
        }
        
    }
}

export default MekaError;