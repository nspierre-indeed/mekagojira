import Utils from '../utils.js';
import MekaPonent from './MekaPonent.js';

class MekaVisualizerSprints extends MekaPonent {
    constructor() {
        super();
        this.wrapper = document.createElement('div');
        this.render([]);
        this.load();
    }
    static get observedAttributes() {
        return ['sprint'];
    }

    get sprint() {
        return this.getAttribute('sprint');
    }

    set sprint(val) {
        if (val) {
            this.setAttribute('sprint', val);
        }
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.dispatchEvent(new CustomEvent('updateSprint', {bubbles: true, cancelable: false, composed: true}));
        }
    }

    async load() {
        const sprints = await this.getSprints();
        const sprint = await this.getSetting('sprint');
        if (sprint) {
            this.setAttribute('sprint', sprint);
        }
        this.render(sprints.values);
    }

    render(sprints) {
        const template = /* html */`
            <style>
                :host {
                    position:absolute;
                    top:10px;
                    right:10px;
                }
                select {
                    min-width: 200px;
                }
            </style>
            <select class="sprintSelector">
                <option value="">- - -</option>
                ${sprints.map((sprint) => (
                    /* html */ `<option value="${sprint.id}" ${(parseInt(this.getAttribute('sprint'), 10) === sprint.id) ? 'selected' : ''}>
                                ${sprint.name}
                                </option>`
                ))}
            </select>
        `;
        this.wrapper.innerHTML = template;
        this.shadowRoot.addEventListener("change", (event) => {
            this.setAttribute('sprint', event.target.value);
            this.setSetting('sprint', event.target.value);
        });
        this.shadowRoot.appendChild(this.wrapper);
    }
    async getSprints() {
        const boardId = Utils.params().id;
        const path = await this.getSetting('jiraPath');
        const sprints = await fetch(`${path}/rest/agile/1.0/board/${boardId}/sprint?state=active,future`);
        const content = await sprints.text();
        const sprintData = JSON.parse(content);
        if (sprintData.values.length === 1 && this.getAttribute('sprint') === 'undefined') {
            this.setAttribute('sprint', sprintData.values[0].id);
        } 
        return sprintData;
    }
}

export default MekaVisualizerSprints;