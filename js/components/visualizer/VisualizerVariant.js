class VisualizerVariant {
    static getStyles() {
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
    static renderSprintDetails(sprintData, path, storyField) {
        if (!sprintData) {
            return '';
        } else {
            return this.renderColumns(Object.entries(sprintData), path, storyField)
        }
    }
    static renderIssue(issue, path, storyField) {
        const storyPoints = issue.fields[storyField];
        return /* html */ `
        <div class="issue">
            <a href="${path}/browse/${issue.key}" target="_blank">
                <img class="avatar" src="${issue?.fields?.assignee?.avatarUrls?.['48x48'] || "img/unassigned.png"}" />
                <span>
                <h4>${issue.key}</h4>
                <p>${storyPoints} pts</p>
                <p>${issue.fields.summary}</p>
                    </span>
            </a>
        </div>
    `;
    }
    static renderColumns(columns, path, storyField) {
        return columns.map(([columnName, issues]) => {
            return this.renderColumn(columnName, issues, path, storyField);
        }).join("");
    }
    static renderColumn(name, issues, path, storyField) {
        const initialValue = 0;
        const pointCount = issues.reduce((prev, current) => {
            return prev + current?.fields[storyField];
        }, initialValue);
        return /* html */ `
            <section class="column">
                <h2>${name} : (${pointCount} pts)</h2>
                ${issues.map((issue) => (this.renderIssue(issue, path, storyField))).join("")}
            </section>`
    }
    static onLoad() {
        // do nothing
    }
    static unLoad() {
        // nothing
    }
};

export default VisualizerVariant;