
// TODO: clean up logic around fetching and rendering: do both from a parent method instead of chaining it
class MekaOptions extends HTMLElement {
  constructor() {
    super();
    let me = this;
    this.attachShadow({ mode: 'open'});
    const wrapper = document.createElement('div');
    const template = `
      <style>
        form {
          max-width:1000px;
          min-width:600px;
          margin:0 auto;
        }
      
        .formGroup {
          display:block;
          padding:20px;
          margin:10px;
          background:#eee;
        }
      
        .formGroup label {
          width:100px;
          display:inline-block;
        }
      
        .formGroup input, .formGroup select {
          padding:5px;
          width:200px;
        }
        meka-mini-loader {
          float:right;
        }
        #savedBoards div {
          padding: 3px 5px;
          margin: 3px;
          border: solid 1px #333;
          border-radius: 5px;
          display:inline-block;
        }
        #savedBoards div button {
          border-radius: 5px;
          border: solid 1px;
          margin-left: 2px;
        }
      </style>
      <form method="get" action="">
        <div class="formGroup">
          <label for="popupQuery">Popup Query</label>
          <input type="text" id="popupQuery" name="popupQuery" placeholder="Insert JQL or choose filter" />
          <em>(leave blank for default of all your assigned unresolved issues)</em>
        </div>
        <div class="formGroup">
          <label for="savedFilters">Saved Filters</label>
          <input list="filters" id="savedFilters" placeholder="Pick Filter or leave blank">
          <datalist id="filters">
          </datalist>
        </div>
        <div class="formGroup">
          <label for="boardInput">Agile Boards <meka-mini-loader></meka-mini-loader></label>
          <input list="boards" id="boardInput" placeholder="Please search by name">
          <datalist id="boards">
          </datalist>
          <div id="savedBoards"></div>
        </div>
        <div class="formGroup">
          <label for="jiraPath">Jira Path</label>
          <input type="text" id="jiraPath" name="jiraPath" />
          <em>(e.g. https://jira.domain.com/ or https://our.domain.com/jira/)</em>
        </div>
        <div class="formGroup" id="message">

        </div>
        <div class="formGroup">
          <button type="button" id="saveSettingButton">Save</button>
        </div>
      </form>
    `;
    wrapper.innerHTML = template;
    this.shadowRoot.appendChild(wrapper);

    me.loadFormData();
  
    me.shadowRoot.getElementById("saveSettingButton").addEventListener("click",() => {
      chrome.storage.sync.set({
        'popupQuery':me.shadowRoot.getElementById('popupQuery').value,
        'jiraPath': me.shadowRoot.getElementById('jiraPath').value.replace(/\/+$/, ''),
        'savedBoards': me.savedBoards
      },() => {
        me.loadFormData();
        this.shadowRoot.getElementById('message').innerHTML = 'Options saved at ' + new Date();
      });
    });
  }

  loadFormData() {
    const me = this;
    chrome.storage.sync.get({popupQuery:'', jiraPath: '', savedBoards: []}, (result) => {
      if (result.popupQuery) {
        me.shadowRoot.getElementById('popupQuery').value = result.popupQuery;
      }
      if (result.jiraPath) {
        me.shadowRoot.getElementById('jiraPath').value = result.jiraPath;
      } else {
        me.shadowRoot.getElementById('message').innerHTML = 'Jira Path is reqired!';
        me.shadowRoot.getElementById('message').style.color = '#f00';
      }
      if (result.savedBoards) {
        me.savedBoards = result.savedBoards;
        me.renderSavedBoards();
      }
      me.getFilters();
      me.bindBoardInput(me.shadowRoot.getElementById('boardInput'));
    });
  }

  getFilters() {
    const me = this;
    chrome.storage.sync.get({jiraPath: null}, async (result) => {
      if (result.jiraPath) {
        const data = await fetch(`${result.jiraPath}/rest/api/latest/filter/favourite`);
        const content = await data.text();
        me.renderFilters(JSON.parse(content));
      }
    });
  }

  async getBoards() {
    const me = this;
    const result = await chrome.storage.sync.get({jiraPath: null});
    if (result.jiraPath) {
      const data = await fetch(`${result.jiraPath}/rest/agile/1.0/board?name=${me.boardName}`);
      const content = await data.text();
      return JSON.parse(content).values;
    }
  }

  renderFilters(filterData) {
    const me = this;
    const filters = me.shadowRoot.getElementById('filters');
    const savedFilters = me.shadowRoot.getElementById('savedFilters');
    const popupQuery = me.shadowRoot.getElementById('popupQuery');
    let filterHtml = '<option value="">- - -</option>';

    me.savedFilters = filterData;
    me.savedFilters.forEach((filter) => {
      filterHtml += `<option value="${filter.id}">${filter.name}</option>`;
    });
    filters.innerHTML = filterHtml;
    savedFilters.addEventListener('input', (event) => {
      const filter = me.savedFilters.find((element) => {
        return element.id === event.target.value; // coming from text field on both sides
      });
      if (filter) {
        popupQuery.value = filter.jql;
      } else {
        popupQuery.value = '';
      }
    });
  }

  renderBoards(boardData) {
    const me = this;
    const boards = me.shadowRoot.getElementById('boards');
    let boardHtml = '<option value="">- - -</option>';

    me.boardsList = boardData;
    me.boardsList.forEach((board) => {
      boardHtml += `<option value="${board.id}">${board.name}</option>`;
    });
    boards.innerHTML = boardHtml;
  }

  bindBoardInput(boardInput) {
    const me = this;
    let loadingBoards = false;
    let cachedTimeout;
    me.shadowRoot.querySelector('meka-mini-loader').done = true;
    boardInput.addEventListener('input', async (event) => {
      if (cachedTimeout) {
        clearTimeout(cachedTimeout);
      }
      const search = event.target.value; 
      cachedTimeout = setTimeout(async () => {
        if (loadingBoards) {
          queuedTerm = search;
          return;
        }
        me.boardName = search;
        loadingBoards = true;
        me.shadowRoot.querySelector('meka-mini-loader').done = false;
        const boards = await me.getBoards();
        const currentSavedIds = me.savedBoards.map(board => board.id);
        const filteredBoards = boards.filter((board) => { return (!currentSavedIds.includes(board.id))});
        me.renderBoards(filteredBoards);
        loadingBoards = false;
        me.shadowRoot.querySelector('meka-mini-loader').done = true;
      }, 300);
    });

    boardInput.addEventListener('change', (event) => {
      const selectedBoard = me.boardsList.find((item) => {
        return item.id === parseInt(event.target.value, 10);
      });
      if (!selectedBoard) {
        event.target.value = '';
        return false;
      }
      me.savedBoards.push(selectedBoard);
      me.renderSavedBoards();
      event.target.value = '';
    });
  }

  renderSavedBoards() {
    const me = this;
    let boardHtml = '';
    me.savedBoards.forEach((board) => {
      boardHtml += `<div>${board.name} (${board.id})<button type="button" class="remove" data-boardid="${board.id}">x</button></div>`;
    });
    me.shadowRoot.getElementById('savedBoards').innerHTML = boardHtml;
    me.shadowRoot.querySelectorAll('.remove').forEach((button) => {
      button.addEventListener('click', (event) => {
        me.savedBoards = me.savedBoards.filter((board) => {
          return board.id !== parseInt(event.target.dataset.boardid, 10);
        });
        me.renderSavedBoards();
      });
    });
  }

}

export default MekaOptions;
