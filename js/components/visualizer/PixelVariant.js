import VisualizerVariant from './VisualizerVariant.js';

const pattern = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let current = 0;
let variantShadowDom = null;

class PixelVariant extends VisualizerVariant {
    static getStyles() {
        return /* html */`
            <style>
                .mainWrapper {
                    font-family:Pixel;
                    background: url('img/pixel_bg.webp') fixed bottom repeat-x rgba(171, 146, 204);
                }

                .column {
                    background-color: #000;
                    color: #eaeaea;
                    position: relative;
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
                    transition: background-color 0.2s;
                }
                .missileTower.closest {
                    background-color: #aeaeae;
                }
                .missileTower.fired {
                    background-color: #f00;
                    transition: background-color 0.2s;
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
                
            </style>
        `;
    }
    static renderIssue(issue, path, storyField) {
        const storyPoints = issue.fields[storyField];
        const pips = this.renderPips(storyPoints);
        return /* html */ `
            <div class="issue">
                <a href="${path}/browse/${issue.key}" target="_blank">
                    <img class="avatar" src="${issue.fields.assignee.avatarUrls['24x24']}" />${issue.key} ${pips}
                </a>
            </div>
        `;
    }
    static renderPips(points) {
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
    static startGame() {
        const columns = variantShadowDom.querySelectorAll('section.column');
        let closest;
        const makeTower = () => {
            const tower = document.createElement('div');
            tower.className = 'missileTower';
            return tower;
        }
        const towers = [];
        columns.forEach((column) => {
            const tower = makeTower();
            towers.push(tower);
            column.appendChild(tower);
        });
        document.addEventListener('mousemove', e => {
            closest = towers[0];
            towers.forEach((tower) => {
                tower.classList.remove('closest');
                const towerBoundingRect = tower.getBoundingClientRect();
                const towerCenter = {
                    x: towerBoundingRect.left + towerBoundingRect.width / 2,
                    y: towerBoundingRect.top + towerBoundingRect.width / 2
                }
                let angle = Math.atan2(e.pageX - towerCenter.x, - (e.pageY - towerCenter.y) )*(180 / Math.PI);
                let distanceX = Math.abs(e.pageX - towerCenter.x);
                if (distanceX < Math.abs(e.pageX - closest.getBoundingClientRect().x)) {
                    closest = tower;
                }
                tower.style.transform = `rotate(${angle}deg)`;
                tower.dataset.angle = angle;
            });
            closest.classList.add('closest');
        });
        document.addEventListener('mouseup', e => {
            const target = closest;
            if (target.classList.contains('fired')) {
                return false;
            }
            target.classList.add('fired');
            window.setTimeout(() => {
                target.classList.remove('fired');
            }, 1000);
        });
    }
    static keyHandler(event) {

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
            PixelVariant.startGame();
        }

    };
}

export default PixelVariant;