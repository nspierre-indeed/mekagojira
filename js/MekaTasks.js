class MekaTasks extends HTMLElement {
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

      this.shadowRoot.querySelector('div').innerHTML = `
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
        </style>
        <h3>Tasks</h3>
        ${tasks.map(task => `<a target="_blank" href="${jiraPath}/browse/${task.key}">
          ${task.key} - ${task.fields.summary}</a><br>
        `).join('')}
      `;
    });
  }
  constructor() {
    super();
    const me = this;
    me.attachShadow({ mode: 'open'});
    const wrapper = document.createElement('div');
    me.shadowRoot.appendChild(wrapper);
  }
}

export default MekaTasks;