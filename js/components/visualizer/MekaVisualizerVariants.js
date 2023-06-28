import MekaPonent from '../MekaPonent.js';

class MekaVisualizerVariants extends MekaPonent {
    constructor() {
        super();
        this.render();
    }
    static get observedAttributes() {
        return ['variant'];
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.dispatchEvent(new CustomEvent('updateVariant', {bubbles: true, cancelable: false, composed: true}));
        }
    }
    async connectedCallback() {
        const variant = await this.getSetting('variant');
        if (variant) {
            this.setAttribute('variant', variant);
        }
    }

    render() {
        const wrapper = document.createElement('div');
        const template = /* html */`
            <style>
                :host {
                    position:absolute;
                    top:34px;
                    right:10px;
                }
            </style>
            <select class="sprintSelector">
                <option value="standard" ${(this.getAttribute('variant') === 'standard' || !this.getAttribute('variant')) ? 'selected':''}>standard</option>
                <option value="pixel" ${(this.getAttribute('variant') === 'pixel') ? 'selected':''}>pixel</option>
            </select>
        `;
        wrapper.innerHTML = template;
        this.shadowRoot.addEventListener("change", (event) => {
            this.setAttribute('variant', event.target.value);
            this.setSetting('variant', event.target.value);
        });
        this.shadowRoot.appendChild(wrapper);
    }
}

export default MekaVisualizerVariants;