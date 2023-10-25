import VisualizerVariant from './VisualizerVariant.js';
import PixelCommand from './PixelCommand.js';

const pattern = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let current = 0;
let variantShadowDom = null;
let animationId;
let paused = false;

class PixelVariant extends VisualizerVariant {
    static getStyles() {
        return /* html */`
            <style>
                :host {
                    overflow: hidden;
                    position: relative;
                }
                .mainWrapper {
                    font-family:Pixel;
                    background: url('img/pixel_bg.webp') fixed bottom repeat-x rgba(171, 146, 204);
                    overflow: hidden;
                    position: relative;
                }
                .gameArea {
                    pointer-events:none;
                    position:absolute;
                    top:0;
                    left:0;
                    right:0;
                    bottom:0;
                }
                .scoreHolder {
                    position: absolute;
                    top: 200px;
                    left: 50px;
                    font-family:Pixel;
                    border: solid 5px #FFF;
                    padding: 20px;
                    font-size: 24px;
                    background: rgba(0,0,0,0.5);
                    color: #fff;
                    font-weight: bold;
                    width: auto;
                    animation: slide-in 2s;
                    z-index:300;
                }
                .scoreHolder.gameOver {
                    left: 50%;
                    width: 400px;
                    margin-left: -220px;
                    transition: left 1s, width 1s;
                }
                .column {
                    background-color: #000;
                    color: #eaeaea;
                    position: relative;
                }

                .column.hit {
                    background-color: rgba(200, 0, 0, 10);
                    transition: background-color 2s;
                    animation: shake 2s infinite alternate, drop 5s;
                    position: relative;
                }
                .column.gone {
                    opacity: 0;
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
                    z-index: 3;
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
                .pips .half {
                    height: 6px;
                }
                .points-half .pip {
                    background: #efe;
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
                .missileTower {
                    width: 10px;
                    height: 80px;
                    background-color: #333;
                    position: absolute;
                    top: -100px;
                    left: 50%;
                    margin-left: -5px;
                    border: solid 2px #fff;
                    z-index:1;
                    animation: loadup linear 1.5s;
                }
                .missileTower.closest {
                    background-color: #aeaeae;
                }
                .missileTower.fired {
                    background-color: #f00;
                    transition: background-color 0.2s;
                }
                .missile {
                    width: 0; 
                    height: 0; 
                    border-left: 10px solid transparent;
                    border-right: 10px solid transparent;
                    border-bottom: 10px solid;
                    position:absolute;
                    transition: top 0.03s linear, left 0.03s linear;
                }
                .friendlyMissile {
                    border-bottom-color: #fff;
                }
                .enemyMissile {
                    border-bottom-color: rgba(200, 0, 0);
                }
                .trail {
                    background: linear-gradient(rgba(255,255,255,1), rgba(0,0,0,0));
                    display:block;
                    position:absolute;
                    width:2px;
                }
                .enemyMissile .trail {
                    background: linear-gradient(rgba(200,0,0,1), rgba(200,0,0,0));
                }
                .explosion {
                    width: 1px;
                    height: 1px;
                    animation: explode 2s;
                    background: #fff;
                    border-radius: 50%;
                    position: absolute;
                    opacity: 1;
                }
                @keyframes loadup {
                    from {
                        top: -30px;
                        height: 0;
                    }
                    to {
                        top: -100px;
                        height: 70px;
                    }
                }
                @keyframes explode {
                    from: {
                        width: 1px;
                        height: 1px;
                        margin-left: 0;
                        margin-top: 0;
                        opacity: 1;
                        background-color: red;
                    }
                    to {
                        width: 100px;
                        height: 100px;
                        margin-left: -50px;
                        margin-top: -50px;
                        opacity: 0;
                        background-color: yellow;
                    }
                }
                @keyframes shake {
                    0% {
                        left: -20px;
                    }
                    22% {
                        left: 10px;
                    }
                    45% {
                        left: -10px;
                    }
                    64% {
                        left: 23px;
                    }
                    89% {
                        left: -5px;
                    }
                    99% {
                        left: 0;
                    }
                }
                @keyframes drop {
                    0% {
                        bottom: 0;
                    }
                    80% {
                        opacity: 1;
                    }
                    100% {
                        opacity: 0;
                        bottom: -500px;
                    }
                }
                @keyframes slide-in {
                    0% {
                        left: -300px;
                    }

                    100% {
                        left: 50px;
                    }
                }
                
            </style>
        `;
    }
    static renderIssue(issue, path, storyField) {
        const storyPoints = issue.fields[storyField];
        const pips = this.renderPips(storyPoints);
        return /* html */ `
            <div class="issue">
                <a href="${path}/browse/${issue.key}" target="_blank">
                    <img class="avatar" src="${issue?.fields?.assignee?.avatarUrls['24x24']}" />${issue.key} ${pips}
                </a>
            </div>
        `;
    }
    static renderPips(points) {
        let countDown = points;
        let pipText = '';
        if (countDown % 1) { // remainder, must be non-integer, only one we allow is 0.5
            pipText += `<div class="half pip"></div>`;
        } else {
            while (countDown--) {
                pipText += `<div class="pip"></div>`;
            }
        }
        return /* html */ `
            <div class="pips points-${(points % 1) ? 'half' : points}">
                ${pipText}
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
                <h2>${name} [${pointCount}]</h2>
                ${issues.map((issue) => (this.renderIssue(issue, path, storyField))).join("")}
            </section>`
    }
    static renderSprintDetails(sprintData, path, storyField) {
        if (!sprintData) {
            return '';
        } else {
            return this.renderColumns(Object.entries(sprintData), path, storyField)
        }
    }
    static onLoad(shadowDom) {
        variantShadowDom = shadowDom;
        // Listen for keydown events
        document.addEventListener('keydown', this.keyHandler, false);
    }
    static unLoad() {
        variantShadowDom = null;
        document.removeEventListener('keydown', this.keyHandler);
    }
    static keyHandler(event) {
        if (event.code === "Space") {
            paused = !paused;
        }
        // If the key isn't in the pattern, or isn't the current key in the pattern, reset
        if (pattern.indexOf(event.key) < 0 || event.key !== pattern[current]) {
            current = 0;
            return;
        }
        // Update how much of the pattern is complete
        current++;
        // If complete, alert and reset
        if (pattern.length === current) {
            current = 0;
            PixelCommand.startGame(variantShadowDom, paused, animationId);
        }
    };
}

export default PixelVariant;