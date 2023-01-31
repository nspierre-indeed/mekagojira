class MekaLoader extends HTMLElement {
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
    const template = `
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

export default MekaLoader;