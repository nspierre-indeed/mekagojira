class MekaBoards extends HTMLElement {
    set boards(value) {
      this.render(value);
    }
  
    render(boards) {
        if (!boards.length) {
            return false;
        }
        chrome.storage.sync.get({jiraPath: null}, (response) => {
            const { jiraPath } = response;
            if (!jiraPath) {
            return;
            }
    
            this.shadowRoot.querySelector('div').innerHTML = `
            <style>
            :host {
                display: block;
            }
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
            <h3>Boards</h3>
            <meka-boards></meka-boards>

            ${boards.map(board => `<a target="_blank" href="${jiraPath}/secure/RapidBoard.jspa?rapidView=${board.id}">
                ${board.name} (${board.id})</a><br>
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
  
  export default MekaBoards;