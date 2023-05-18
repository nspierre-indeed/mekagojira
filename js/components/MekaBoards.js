import MekaPonent from "./MekaPonent.js";

class MekaBoards extends MekaPonent {
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
    
            super.query('div').innerHTML = /* html */ `
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
            a img {
                vertical-align:middle;
            }
            a:hover img {
                filter: brightness(0.5);
            }
            </style>
            <h3>Boards</h3>
            <meka-boards></meka-boards>

            ${boards.map(board => /* html */ `
            <a target="_blank" href="${jiraPath}/secure/RapidBoard.jspa?rapidView=${board.id}">
                ${board.name} (${board.id})</a> <a target="blank" href="board_view.html?id=${board.id}&name=${board.name}"><img src="img/eye-svgrepo-com.svg" width="20" height="20" /></a> <br>
            `).join('')}
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
  
  export default MekaBoards;