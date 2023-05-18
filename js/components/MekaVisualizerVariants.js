import MekaPonent from './MekaPonent.js';

class MekaVisualizerVariants extends MekaPonent {
    constructor() {
        super();
        this.render();
    }
    static get observedAttributes() {
        return ['variant'];
    }
    attributeChangedCallback(name, oldValue, newValue) {
        this.dispatchEvent(new CustomEvent('updateVariant', {bubbles: true, cancelable: false, composed: true}));
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
        });
        this.shadowRoot.appendChild(wrapper);
    }
}

export default MekaVisualizerVariants;