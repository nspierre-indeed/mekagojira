class MekaPonent extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open'});
    }
    async getSetting(settingName, defaultSettingValue = null) {
        const fetchObj = {};
        fetchObj[settingName] = defaultSettingValue;
        const storagePromise = await chrome.storage.sync.get(fetchObj);
        return storagePromise[settingName];
    }
    async setSetting(settingName, value) {
        const setObj = {};
        setObj[settingName] = value;
        const storagePromise = await chrome.storage.sync.set(setObj);
        return storagePromise;
    }
    query(string) {
        return this.shadowRoot.querySelector(string);
    }
    queryAll(string) {
        return this.shadowRoot.querySelectorAll(string);
    }
}

export default MekaPonent;