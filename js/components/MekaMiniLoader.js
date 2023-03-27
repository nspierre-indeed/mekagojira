class MekaMiniLoader extends HTMLElement {
  static get observedAttributes() {
    return ['done'];
  }

  get done() {
    return this.hasAttribute('done');
  }

  set done(val) {
    if (val) {
      this.setAttribute('done', '');
    } else {
      this.removeAttribute('done');
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (this.done) {
      this.classList.add('done');
    } else {
      this.classList.remove('done');
    }
  }

  constructor() {
    super();
    const wrapper = document.createElement('div');
    const shadow = this.attachShadow({ mode: 'open'});
    const template = /* html */`
      <style>
      :host {
        border: 4px solid #f3f3f3; /* Light grey */
        border-top: 4px solid #3498db; /* Blue */
        border-radius: 50%;
        width: 10px;
        height: 10px;
        animation: spin 2s linear infinite;
        opacity:1;
        position:static;
        display:block;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      :host(.done) {
          opacity:0; 
          transition: opacity 0.5s;
      }

      </style>
      <figure class="loadingContainer">
        <figcaption>
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </figcaption>
      </figure>`;
      wrapper.innerHTML = template;
      this.shadowRoot?.appendChild(wrapper);
  }
  
}

export default MekaMiniLoader;