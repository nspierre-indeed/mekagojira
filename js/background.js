chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const { operation, data } = message;
    if (operation === 'fetchData') {
        const { jiraPath, query } = data;
        const path = `${jiraPath}/rest/api/latest/search?jql=${query}`;
        fetchData(path).then((responseData) => {
            sendResponse(responseData);
        });
    }
    return true;
});

const fetchData = async (path) => {
    let pips = 1;
    const loadingTimer = setInterval(() => {
      pips = (pips === 3) ? 1 : pips + 1;
      let text = '.'.repeat(pips);
      text += ' '.repeat(3-pips);
      chrome.action.setBadgeText({ text });
    }, 100);
    
    const response = await fetch(path);
    const responseText = await (response.text());
    clearInterval(loadingTimer);
    return JSON.parse(responseText);
}
