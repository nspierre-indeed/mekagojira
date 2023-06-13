import MekaPonent from "../MekaPonent.js";

class MekaTasks extends MekaPonent {
  // TODO: look into how best to handle attributes / properties in customElements
  // you cannot use objects/vectors as attributes, only strings or numbers (limited type scalars)
  // Not sure if this is the right way to be using these but it works for now.
  set tasks(value) {
    this.render(value);
  }

  render(tasks) {
    chrome.storage.sync.get({jiraPath: null}, (response) => {
      const { jiraPath } = response;
      if (!jiraPath) {
        return;
      }

      this.shadowRoot.querySelector('div').innerHTML = /* html */`
        <style>
        /* Light mode */
        @media (prefers-color-scheme: light) {
            a {
                color: #222;
            }
        }
        /* Dark mode */
        @media (prefers-color-scheme: dark) {
            a {
                color: #eaeaea;
            }
        }
        li {
          margin: 4px 0;
          padding: 3px;
        }
        ul {
          padding:0;
          margin:0;
          list-style-type: none;
        }
        </style>
        <h3>Tasks</h3>
        <ul>
          ${tasks.map(task => `<li><a target="_blank" href="${jiraPath}/browse/${task.key}">
            ${task.key} - ${task.fields.summary}</a></li>
          `).join('')}
        </ul>
      `;
    });
  }
  constructor() {
    super();
    const me = this;
    const wrapper = document.createElement('div');
    me.shadowRoot.appendChild(wrapper);
  }
}

export default MekaTasks;