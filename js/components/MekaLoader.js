import MekaPonent from "./MekaPonent.js";

class MekaLoader extends MekaPonent {
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

  getStyle() {
    if (this.getAttribute('variant') === 'pixel') {
      return this.getPixelStyle();
    }
    return this.getStandardStyle();
  }

  getPixelStyle() {
    return /* html */ `
    <style>
      :host {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index:20;
        opacity:1;
        padding:30px;
        border: solid 2px #eaeaea;
        background: rgba(0,0,0,0.2);
        margin:0;
      }
    
      :host(.done) {
        opacity:0;
        pointer-events: none;
      }
    
      :host .dot {
        width: 30px;
        height: 30px;
        float: left;
        margin: 0 5px;
        transform: scale(0);
        animation: fx 1000ms ease 0ms infinite;
        background-color: #eaeaea;
      }
      :host  .dot:nth-child(2) {
        animation: fx 1000ms ease 300ms infinite;
      }
      :host .dot:nth-child(3) {
        animation: fx 1000ms ease 600ms infinite;
      }

    @keyframes fx {
      50% {
        transform: scale(1);
        opacity: 1;
      }
      100% {
        opacity: 0;
      }
    }
    </style>`;
  }

  getStandardStyle() {
    return /* html */ `
      <style>
        :host {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index:20;
          transition: opacity 0.5s ease-in-out;
          opacity:1;
          padding:0;
          margin:0;
        }
      
        :host(.done) {
          opacity:0;
          pointer-events:none;
        }
      
        :host .dot {
          width: 10px;
          height: 10px;
          border: 2px solid;
          border-radius: 50%;
          float: left;
          margin: 0 5px;
          transform: scale(0);
          animation: fx 1000ms ease 0ms infinite;
        }
        :host  .dot:nth-child(2) {
          animation: fx 1000ms ease 300ms infinite;
        }
        :host .dot:nth-child(3) {
          animation: fx 1000ms ease 600ms infinite;
        }

      /* Light mode */
      @media (prefers-color-scheme: light) {
          :host .dot {
            border-color: #333;
          }
      }
      /* Dark mode */
      @media (prefers-color-scheme: dark) {
          :host .dot {
            border-color: #eaeaea;
          }
      }
      @keyframes fx {
        50% {
          transform: scale(1);
          opacity: 1;
        }
        100% {
          opacity: 0;
        }
      }
      </style>
    `;
  }

  constructor() {
    super();
    const wrapper = document.createElement('div');
    const template = /* html */ `
      ${this.getStyle()}
      <figure class="loadingContainer">
        <figcaption>
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </figcaption>
      </figure>`;
      wrapper.innerHTML = template;
      this.shadowRoot.appendChild(wrapper);
  }
  
}

export default MekaLoader;