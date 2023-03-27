import MekaPonent from "./MekaPonent.js";

// TODO: create individual components for each option, and have them sync their own state / update their own views to simplify this 
class MekaOptions extends MekaPonent {
  constructor() {
    super();
    let me = this;
    const wrapper = document.createElement('div');
    const template = /* html */ `
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
        <meka-option option="jiraPath"></meka-option>
        <meka-option option="refreshInterval"></meka-option>
        <meka-option option="popupQuery"></meka-option>
        <meka-option option="savedFilters"></meka-option>
        <!-- the filters one and agile boards are complex, may need their own sub-component of meka-option -->
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
  
    super.query("#saveSettingButton").addEventListener('click', () => {
      const values = {
        'popupQuery':super.query('meka-option[option="popupQuery"]').getAttribute('value'),
        'jiraPath': super.query('meka-option[option="jiraPath"]').getAttribute('value').replace(/\/+$/, ''),
        'refreshInterval': parseFloat(super.query('meka-option[option="refreshInterval"]').getAttribute('value')),
        'savedBoards': me.savedBoards
      };
      chrome.storage.sync.set(values, (vals) => {
        me.loadFormData();
        super.query('#message').innerHTML = 'Options saved at ' + new Date();
      });
    });
  }

  loadFormData() {
    const me = this;
    chrome.storage.sync.get({savedBoards: []}, (result) => {
      if (result.savedBoards) {
        me.savedBoards = result.savedBoards;
        me.renderSavedBoards();
      }
      me.getFilters();
      me.bindBoardInput(super.query('#boardInput'));
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
    const filters = super.query('#filters');
    const savedFilters = super.query('#savedFilters');
    const popupQuery = super.query('meka-option[option="popupQuery"]');
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
    const boards = super.query('#boards');
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
    super.query('meka-mini-loader').done = true;
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
        super.query('meka-mini-loader').done = false;
        const boards = await me.getBoards();
        const currentSavedIds = me.savedBoards.map(board => board.id);
        const filteredBoards = boards.filter((board) => { return (!currentSavedIds.includes(board.id))});
        me.renderBoards(filteredBoards);
        loadingBoards = false;
        super.query('meka-mini-loader').done = true;
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
    super.query('#savedBoards').innerHTML = boardHtml;
    super.queryAll('.remove').forEach((button) => {
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
