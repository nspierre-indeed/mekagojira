import MekaPonent from "./MekaPonent.js";

class MekaOption extends MekaPonent {
    static get observedAttributes() {
        return ['value', 'option'];
    }

    async getSetting(settingName, defaultSettingValue = null) {
        const fetchObj = {};
        fetchObj[settingName] = defaultSettingValue;
        const storagePromise = await chrome.storage.sync.get(fetchObj);
        return storagePromise[settingName];
    }

    async setSetting(settingName, settingValue) {
        const setObj = {};
        setObj[settingName] = settingValue;
        return await chrome.storage.sync.set(setObj);
    }

    set value(v) {
        this.setAttribute('value', v);
    }

    set option(v) {
        this.setAttribute('option', v);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (newValue !== oldValue) {
            this.render();
        }
    }

    async connectedCallback() {
        const optionName = this.getAttribute('option');
        if (optionName) {
            const value = await this.getSetting(optionName);
            this.setAttribute('value', value);
        }
        this.render();
    }

    constructor() {
        super();
        const wrapper = document.createElement('div');
        wrapper.className = 'formGroup';
        this.shadowRoot.appendChild(wrapper);
        const baseTemplate = /* html */ `
        <style>
            .formGroup {
                display:block;
                padding:20px;
                margin:10px;
                background:#eee;
            }
        
            .formGroup label {
                width:100px;
                display:inline-block;
            }
        
            .formGroup input, .formGroup select {
                padding:5px;
                width:250px;
            }
            .formGroup textarea {
                width:250px;
                height:100px;
                padding:5px;
            }
        </style>
        <section></section>
        `;
        super.query('div').innerHTML = baseTemplate;
    }

    render() {
        if (!this.getAttribute('value')) {
            this.setAttribute('value','');
        }
        super.query('section').innerHTML = this.templates[this.getAttribute('option')];
        super.query('.userInput')?.addEventListener('change', (event) => {
            this.setAttribute('value', event.target.value);
        });
    }

    get templates() {
        return {
            refreshInterval: /* html */ `
                <label for="refreshInterval">Refresh Interval</label>
                <input class="userInput" type="number" id="refreshInterval" name="refreshInterval" step="0.1" min="0.1" max="60" value="${this.getAttribute('value')}" />
                <em>(in minutes, from 0.1 to 60)</em>
            `,
            savedFilters: /* html */`
                <meka-option-filters filters="${this.getAttribute('value')}"></meka-option-filters>
            `,
            jiraPath: /* html */`
                <label for="jiraPath">Jira Path</label>
                <input class="userInput" type="text" id="jiraPath" name="jiraPath" value="${this.getAttribute('value')}" />
                <em>(e.g. https://jira.domain.com/ or https://our.domain.com/jira/)</em>
            `,
            popupQuery: /* html */`
                <label for="popupQuery">Popup Query</label>
                <textarea class="userInput" id="popupQuery" name="popupQuery" placeholder="Insert JQL or choose filter">${this.getAttribute('value')}</textarea>
                <em>(leave blank for default of all your assigned unresolved issues)</em>
            `,
        };
    }
}

export default MekaOption;