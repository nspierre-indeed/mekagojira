class MekaPonent extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open'});
    }
    query(string) {
        return this.shadowRoot.querySelector(string);
    }
    queryAll(string) {
        return this.shadowRoot.querySelectorAll(string);
    }
}

export default MekaPonent;