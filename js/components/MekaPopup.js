import MekaPonent from './MekaPonent.js';

class MekaPopup  extends MekaPonent {
  static get observedAttributes() {
    return ['loading'];
  }
  get loading() {
    return this.hasAttribute('loading');
  }
  set loading(val) {
    if (val) {
      this.setAttribute('loading', '');
    } else {
      this.removeAttribute('loading');
    }
  }
  attributeChangedCallback(_name, _oldValue, _newValue) {
    if (this.loading) {
      super.query('meka-loader').done = false;
    } else {
      super.query('meka-loader').done = true;
    }
  }
  constructor() {
    super();
    const me = this;
    me.loading = true;
    me.defaultQuery = 'assignee%3DCurrentUser()%20and%20resolution%20=%20Unresolved';
    const wrapper = document.createElement('div');
    const template = /* html */`
      <style>
        :host {
          font-family:"Segoe UI", Roboto, sans-serif;
          height:100%;
          z-index:0;
          margin:0;
          padding:0;
        }
        article {
          z-index:10;
          padding:5px;
        }
      </style>
      
      <article>
        <meka-loader></meka-loader>
        <meka-tasks></meka-tasks>
        <meka-boards></meka-boards>
        <meka-error></meka-error>
      </article>
      <meka-nav></meka-nav>
    `;
    wrapper.innerHTML = template;
    me.shadowRoot.appendChild(wrapper);
    me.init();
  }

  async fetchData() {
    const me = this;
    chrome.runtime.sendMessage({operation: 'fetchData', data: { popupQuery: me.query, jiraPath: me.jiraPath }});
  }

  updateData(data) {
    const me = this;
    if (data.issues) {
      super.query('meka-tasks').tasks = data.issues;
      me.loading = false;
    }
  }

  init() {
    const me = this;
    chrome.storage.sync.get({popupQuery:me.defaultQuery, jiraPath:'', savedBoards: []}, (result) => {
      const { jiraPath } = result;
      if (!jiraPath) {
        chrome.tabs.create({
          active: true,
          url: 'options.html'
        })
        return;
      }
      me.jiraPath = jiraPath;
      me.query = result.popupQuery || me.defaultQuery;
      me.fetchData();
      if (result.savedBoards) {
        super.query('meka-boards').boards = result.savedBoards;
      }
    });

    chrome.storage.onChanged.addListener((changes) => {
      const { jiraPath, query, displayData, savedBoards } = changes;
      if (displayData) {
        me.updateData(displayData.newValue);
      }
      me.jiraPath = jiraPath || me.jiraPath;
      me.query = query || me.query;
      if (jiraPath || query) {
        me.fetchData();
      }
      if (savedBoards) {
        super.query('meka-boards').boards = savedBoards;
      }
    });
  }
}

export default MekaPopup;
