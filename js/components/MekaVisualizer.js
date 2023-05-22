import MekaPonent from './MekaPonent.js';
import Utils from '../utils.js';
class MekaVisualizer extends MekaPonent {
    constructor() {
        super();
        this.wrapper = document.createElement('div');
        this.wrapper.className = 'mainWrapper';
        this.shadowRoot.appendChild(this.wrapper);
        this.boardId = Utils.params().id;
        this.boardName = Utils.params().name;
        this.variant = "standard";
        this.render();
    }
    async getStoryPointField() {
        const path = await this.getSetting('jiraPath');
        const fieldRequest = await fetch(`${path}/rest/api/2/field`);
        const fieldData = JSON.parse(await fieldRequest.text());
        const storyPointField = fieldData.find((field) => {
            return field.name === 'Story Points';
        });
        return storyPointField.id;
    }
    async getBoardColumns() {
        const path = await this.getSetting('jiraPath');
        const configRequest = await fetch(`${path}/rest/agile/1.0/board/${this.boardId}/configuration`);
        const configData = JSON.parse(await configRequest.text());
        return configData.columnConfig.columns;
    }
    async render() {
        const [storyField, columns] = await Promise.all([this.getStoryPointField(), this.getBoardColumns()]);
        this.storyField = storyField;
        this.columns = columns;
        this.template = /* html */ `
            ${this.getStyles()}
            <h1>${this.boardName}</h1>
            <nav>
                <meka-visualizer-sprints sprint="${this.sprint}"></meka-visualizer-sprints>
                <meka-visualizer-variants variant="${this.variant}"></meka-visualizer-variants>
            </nav>
            <meka-loader variant="${this.variant}"></meka-loader>
            <section class="columns">
              ${this.renderSprintDetails()}
            </section>
        `;
        this.wrapper.innerHTML = this.template;
        this.query('meka-visualizer-variants').addEventListener('updateVariant', (event) => {
            if (this.variant && event.target.getAttribute('variant') === this.variant) {
                return false;
            }
            this.variant = event.target.getAttribute('variant');
            if (this.sprint) {
                this.reload();
            }
        });
        this.query('meka-visualizer-sprints').addEventListener('updateSprint', async (event) => {
            const targetSprint = event.target.getAttribute('sprint');
            if (!targetSprint) {
                return false;
            }
            this.sprint = targetSprint;
            await this.reload();
        });
    }
    async reload() {
        this.query('meka-loader').done = false;
        const sprintData = await this.getSprintData();
        this.sprintData = this.sortSprintData(sprintData.issues);
        await this.render();
        this.query('meka-loader').done = true;
    }
    getStyles() {
        if (this.variant === 'pixel') {
            return this.getPixelStyle();
        }
        return this.getStandardStyle();
    }
    getPixelStyle() {
        return /* html */`
            <style>
                .mainWrapper {
                    font-family:Pixel;
                    background: url('img/pixel_bg.webp') fixed bottom repeat-x rgba(171, 146, 204);
                }

                .column {
                    background-color: #000;
                    color: #eaeaea;
                }
                nav {
                    z-index: 100;
                    position: relative;
                }

                h1 {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    text-align:center;
                    text-shadow:2px 2px 1px #222;
                    font-size: 42px;
                    color: #eaeaea;
                    z-index: 1;
                    pointer-events:none;
                }
                .columns {
                    display:flex;
                    justify-content:space-around;
                    min-height:100vh;
                    z-index: 2;
                    position: relative;
                }
                .column {
                    align-self: end;
                    padding: 20px;
                    border: dashed 2px;
                    max-width:400px;
                    text-align:center;
                }
                .column h2 {
                    text-align:center;
                    border: solid 1px;
                    width: auto;
                    position: relative;
                    top: -100px;
                    padding: 10px 30px;
                    background-color: #333;
                    overflow: visible;
                    margin-bottom: -60px;
                    white-space: nowrap;
                    height:22px;
                    line-height:22px;
                }
                .column h2::before {
                    content:'';
                    position: absolute;
                    bottom: -20px;
                    left: 10px;
                    width: 6px;
                    height: 20px;
                    background: #eaeaea;
                }
                .column h2::after {
                    content:'';
                    position: absolute;
                    bottom: -20px;
                    right: 10px;
                    width: 6px;
                    height: 20px;
                    background: #eaeaea;
                }
                .avatar {
                    width:48px;
                    height:48px;
                    border:none;
                    display: block;
                    margin: 0 auto;
                    image-rendering: pixelated;
                    filter: grayscale(100%) sepia(100%) hue-rotate(40deg) contrast(1.5) brightness(0.9);
                    transition: filter 0.5s;
                    position:relative;
                }
                .issue {
                    width: 120px;
                    height: 80px;
                    display: inline-block;
                    text-align: center;
                }
                a {
                    color: #aaa;
                    text-decoration: none;
                    font-weight: bold;
                    transition: color 0.5s;
                }
                a:hover {
                    color: #fff;
                    transition: color 0.5s;
                }
                a:hover .avatar {
                    transition: filter 0.5s;
                    filter: grayscale(0%) sepia(0%) hue-rotate(0deg) contrast(1) brightness(1); 
                }
                a:hover .pip {
                    background: #fff;
                    transition: background 0.5s;
                }
                .pips .pip {
                    background: #fff;
                    width:4px;
                    height:12px;
                    margin:0 2px;
                    display: inline-block;
                }
                .points-1 .pip {
                    background: #9f9;
                }
                .points-2 .pip {
                    background: #99f;
                }
                .points-3 .pip {
                    background: #f8ed62;
                }
                .points-5 .pip {
                    background: #fa0;
                }
                .points-8 .pip {
                    background: #f99;
                }
                
            </style>
        `;
    }
    getStandardStyle() {
        return /* html */`
            <style>
                .mainWrapper {
                    background: #333;
                    min-height: 100vh;
                    font-family: "Roboto", arial, sans-serif;
                }
                h1 {
                    margin: 0 0 20px 20px;
                    padding-top: 20px;
                }
                /* Light mode */
                @media (prefers-color-scheme: light) {
                    .column {
                        background-color: #eaeaea;
                    }
                    .column a {
                        color: #222;
                    }
                    .mainWrapper {
                        color: #222;
                    }
                    h1 {
                        color: #eee;
                    }
                    .column .issue {
                        border-color: #333;
                    }
                }
                /* Dark mode */
                @media (prefers-color-scheme: dark) {
                    .column {
                        background-color: #000;
                    }
                    .mainWrapper {
                        color: #eaeaea;
                    }
                }
                .columns {
                    display:flex;
                    flex-direction:column;
                    justify-content:space-evenly;
                }
                .column {
                    padding: 20px;
                    text-align:center;
                    border-radius: 2px;
                    border: solid 2px #eee;
                    width: 80vw;
                    align-self: center;
                    margin: 20px 0;
                }
                .column h4 {
                    font-size:18px;
                    vertical-align: top;
                    margin: 0;
                }
                .column span {
                    display: inline;
                }
                .avatar {
                    width:48px;
                    height:48px;
                    border:none;
                    float: left;
                    margin: 8px;
                }
                .issue {
                    text-align: left;
                    border: solid 2px #eaeaea;
                    min-width: 220px;
                    margin: 10px 0px;
                    clear: both;
                    padding: 5px;
                    border-radius: 2px;
                }
                .issue p {
                    margin: 2px;
                    font-size: 18px;
                }
                .issue a {
                    display: block;
                    width: 100%;
                    height: 100%;
                }
                a {
                    color: #aaa;
                    text-decoration: none;
                    font-weight: bold;
                    transition: color 0.5s;
                }
                a:hover {
                    color: #fff;
                    background: #777;
                    transition: color 0.5s, background 0.5s;
                }
                a:hover .avatar {
                    transition: filter 0.5s;
                    filter: grayscale(0%) sepia(0%) hue-rotate(0deg) contrast(1) brightness(1); 
                }
                a:hover .pip {
                    background: #fff;
                    transition: background 0.5s;
                }
                .pips .pip {
                    background: #fff;
                    width:4px;
                    height:12px;
                    margin:0 2px;
                    display: inline-block;
                }
                .points-1 .pip {
                    background: #9f9;
                }
                .points-2 .pip {
                    background: #99f;
                }
                .points-3 .pip {
                    background: #f8ed62;
                }
                .points-5 .pip {
                    background: #fa0;
                }
                .points-8 .pip {
                    background: #f99;
                }
                
            </style>
        `;
    }
    sortSprintData(issues) {
        const statusesToColumnNames = new Map();
        const colsToIssues = {};
        this.columns.forEach((column) => {
            column.statuses.forEach((status) => {
                statusesToColumnNames.set(status.id, column.name);
                colsToIssues[column.name] = [];
            });
        });
        issues.forEach((issue) => {
            const status = issue.fields.status.id;
            const columnName = statusesToColumnNames.get(status);
            colsToIssues[columnName].push(issue);
        });

        return colsToIssues;
    }
    async getSprintData() {
        const path = await this.getSetting('jiraPath');
        this.path = path;
        const sprintData = await fetch(`${path}/rest/agile/1.0/sprint/${this.sprint}/issue`);
        return JSON.parse(await sprintData.text());
    }
    renderSprintDetails() {
        if (!this.sprintData) {
            return '';
        } else {
            return this.renderColumns(Object.entries(this.sprintData))
        }
    }
    renderColumns(columns) {
        return columns.map(([columnName, issues]) => {
            return this.renderColumn(columnName, issues);
        }).join("");
    }
    renderColumn(name, issues) {
        return /* html */ `
            <section class="column">
                <h2>${name}</h2>
                ${issues.map((issue) => (this.renderIssue(issue))).join("")}
            </section>`
    }
    renderPips(points) {
        let countDown = points;
        let pipText = '';
        while (countDown--) {
            pipText += `<div class="pip"></div>`;
        }
        return /* html */ `
            <div class="pips points-${points}">
                ${pipText}
            </div>
        `;
    }
    renderIssue(issue) {
        const storyPoints = issue.fields[this.storyField];
        const pips = this.renderPips(storyPoints);
        const path = this.path;
        if (this.variant === 'pixel') {
            return /* html */ `
            <div class="issue">
                <a href="${path}/browse/${issue.key}" target="_blank">
                    <img class="avatar" src="${issue.fields.assignee.avatarUrls['24x24']}" />${issue.key} ${pips}
                </a>
            </div>`;
        } else {
            return /* html */ `
            <div class="issue">
                <a href="${path}/browse/${issue.key}" target="_blank">
                    <img class="avatar" src="${issue.fields.assignee.avatarUrls['48x48']}" />
                    <span>
                    <h4>${issue.key}</h4>
                    <p>${storyPoints} pts</p>
                    <p>${issue.fields.summary}</p>
                     </span>
                </a>
            </div>
            `
        }
        
    }
}

export default MekaVisualizer;