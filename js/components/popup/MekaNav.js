import MekaPonent from "../MekaPonent.js";

class MekaNav extends MekaPonent {
  constructor() {
    super();
    const me = this;
    const wrapper = document.createElement('div');
    this.template = /*html */ `
      <style>
        /* Light mode */
        @media (prefers-color-scheme: light) {
            nav a {
                color: #222;
            }
        }
        /* Dark mode */
        @media (prefers-color-scheme: dark) {
            nav a {
                color: #eaeaea;
            }
        }
        nav {
          position:fixed;
          bottom:0;
          left:0;
          right:0;
          z-index:11;
          padding:10px;
        }
        nav .left {
          float:left;
        }
      
        nav .right {
          float:right;
        }

        :host div {
          margin-top:35px;
        }
       
      </style>
      <nav>
        <a target="_blank" class="right" href="options.html">Configure</a>
      </nav>
    `;
    wrapper.innerHTML = me.template;
    me.shadowRoot.appendChild(wrapper);
  }
}

export default MekaNav;