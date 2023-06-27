import VisualizerVariant from './VisualizerVariant.js';

const pattern = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let current = 0;
let variantShadowDom = null;
let animationId;

class PixelVariant extends VisualizerVariant {
    static getStyles() {
        return /* html */`
            <style>
                .mainWrapper {
                    font-family:Pixel;
                    background: url('img/pixel_bg.webp') fixed bottom repeat-x rgba(171, 146, 204);
                    overflow: hidden;
                    position: relative;
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
    // TODO: put these all in a helper class or something
    static startGame() {
        // make towers
        const columns = variantShadowDom.querySelectorAll('section.column');
        let closestTower;
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
        // make holders for missiles
        const enemyMissiles = [];
        const friendlyMissiles = [];
        const makeMissile = (enemy = false) => {
            const missile = document.createElement('div');
            missile.classList.add('missile');
            missile.classList.add((enemy) ? 'enemyMissile' : 'friendlyMissile');
            const trail = document.createElement('div');
            trail.classList.add('trail');
            missile.appendChild(trail);
            return missile;
        };
        const makeEnemyMissile = () => {
            const enemyMissile = makeMissile(true);
            const angle = randomIntFromInterval(100, 250);
            enemyMissile.dataset.angle = angle;
            enemyMissile.style.transform = `rotate(${angle}deg)`;
            const randomLeft = randomIntFromInterval(30, window.innerWidth - 30);
            enemyMissile.style.top = '20px';
            enemyMissile.style.left = `${randomLeft}px`;
            enemyMissile.dataset.origin = `0,${randomLeft}`;
            variantShadowDom.appendChild(enemyMissile);
            enemyMissiles.push(enemyMissile);
        };
        const randomIntFromInterval = (min, max) => { // min and max included 
            return Math.floor(Math.random() * (max - min + 1) + min)
        };
        // functions to make math easier
        // const mid_point = ([x1, y1], [x2, y2]) => [(x1 + x2) / 2, (y1 + y2) / 2];
        const center = (target) => {
            const rect = target.getBoundingClientRect();
            return {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
            };
        };
        const findNewPoint = (x, y, angle, distance) => {
            const result = {};
        
            result.x = Math.cos((angle) * Math.PI / 180) * distance + x;
            result.x = parseFloat(result.x).toFixed(2);
            result.y = Math.sin((angle) * Math.PI / 180) * distance + y;
            result.y = parseFloat(result.y).toFixed(2);
            return result;
        };
        const getDistance = (x1, y1, x2, y2) => {
            let y = x2 - x1;
            let x = y2 - y1;
            return Math.sqrt(x * x + y * y);
        };
        const checkCollision = (point) => {
            const collisions = [];
            enemyMissiles.forEach((enemyMissile, idx) => {
                const targetX = enemyMissile.style.left;
                const targetY = enemyMissile.style.top;
                const distance = getDistance(
                    parseFloat(point.x).toFixed(2),
                    parseFloat(point.y).toFixed(2),
                    parseFloat(targetX).toFixed(2),
                    parseFloat(targetY).toFixed(2));

                if (distance < 50) {
                    collisions.push(idx);
                }
            });
            return collisions;
        };
        // listeners
        document.addEventListener('mousemove', e => {
            closestTower = towers[0];
            towers.forEach((tower) => {
                tower.classList.remove('closest');
                const towerCenter = center(tower);
                let distanceX = Math.abs(e.pageX - towerCenter.x);
                if (distanceX < Math.abs(e.pageX - closestTower.getBoundingClientRect().x)) {
                    closestTower = tower;
                }
                let angle = Math.atan2(e.pageX - towerCenter.x, - (e.pageY - towerCenter.y) )*(180 / Math.PI);
                // convert to circle instead of negative
                if (angle < 0) {
                    angle = 360 + angle;
                }
                tower.dataset.angle = parseFloat(angle).toFixed(2);
            });
            // TODO: look into putting this inside the step function
            window.requestAnimationFrame(() => {
                closestTower.style.transform = `rotate(${closestTower.dataset.angle}deg)`;
                closestTower.classList.add('closest');
            });
        });
        document.addEventListener('mouseup', e => {
            const target = closestTower;
            if (target.classList.contains('fired')) {
                return false;
            }
            const towerCenter = center(target);
            target.classList.add('fired');
            const missile = makeMissile();
            variantShadowDom.appendChild(missile);
            const offsetAngle = parseFloat(target.dataset.angle) + 90;
            const newPoint = findNewPoint(towerCenter.x, towerCenter.y, offsetAngle, -50);
            missile.style.left = `${newPoint.x - (missile.getBoundingClientRect().width / 2)}px`;
            missile.style.top = `${newPoint.y - (missile.getBoundingClientRect().height / 2)}px`;
            missile.dataset.angle = target.dataset.angle;
            missile.dataset.origin = `${missile.style.left},${missile.style.top}`;
            missile.style.transform = `rotate(${missile.dataset.angle}deg)`;
            friendlyMissiles.push(missile);
            // TODO: look into putting this inside the step function
            window.setTimeout(() => {
                window.requestAnimationFrame(() => {
                    target.classList.remove('fired');
                });
            }, 1000);
        });
        let now = Date.now();
        let then = now;
        let elapsed = 0;
        const speed = 10;
        const enemySpawnSpeed = 5000;
        let lastSpawn = 5000;
        const step = () => {
            then = now;
            now = Date.now();
            elapsed = now - then;
            if (lastSpawn < 1) {
                makeEnemyMissile();
                lastSpawn = enemySpawnSpeed;
            } else {
                lastSpawn -= elapsed;
            }
            
            const moveDistance = (elapsed * speed) / 33.3; // 5 frames per 33.3 milliseconds
            enemyMissiles.forEach((missile, index) => {
                const origin = missile.dataset.origin.split(',');
                const [ originX, originY ] = origin;
                const oldPoint = {
                    x: parseFloat(missile.style.left),
                    y: parseFloat(missile.style.top)
                };
                if (oldPoint.y > window.innerHeight || oldPoint.x < 1 || oldPoint.x > window.innerWidth - 30) {
                    enemyMissiles.splice(index, 1);
                    variantShadowDom.removeChild(missile);
                    return;
                }
                const offsetAngle = parseFloat(missile.dataset.angle) + 90;
                const newPoint = findNewPoint(oldPoint.x, oldPoint.y, offsetAngle, -1 * (moveDistance / 2 ));
                missile.style.left = `${newPoint.x}px`;
                missile.style.top = `${newPoint.y}px`;
                const trailLength = getDistance(parseFloat(originX), parseFloat(originY).toFixed(2), newPoint.x, newPoint.y);
                const trail = missile.querySelector('.trail');
                trail.style.height = `${trailLength+10}px`;
            });
            friendlyMissiles.forEach((missile, index) => {
                const origin = missile.dataset.origin.split(',');
                const [ originX, originY ] = origin;
                const oldPoint = {
                    x: parseFloat(missile.style.left),
                    y: parseFloat(missile.style.top)
                };
                const collisions = checkCollision(oldPoint);
                if (collisions.length > 0) {
                    collisions.forEach((index) => {
                        const targetMissile = enemyMissiles[index];
                        enemyMissiles.splice(index, 1);
                        variantShadowDom.removeChild(targetMissile);
                    });
                }
                if (collisions.length > 0 || oldPoint.y < 1 || oldPoint.x < 1 || oldPoint.x > window.innerWidth - 30) {
                    friendlyMissiles.splice(index, 1);
                    variantShadowDom.removeChild(missile);
                    return;
                }
                const offsetAngle = parseFloat(missile.dataset.angle) + 90;
                const newPoint = findNewPoint(oldPoint.x, oldPoint.y, offsetAngle, -1 * moveDistance);
                missile.style.left = `${newPoint.x}px`;
                missile.style.top = `${newPoint.y}px`;
                const trailLength = getDistance(parseFloat(originX), parseFloat(originY).toFixed(2), newPoint.x, newPoint.y);
                const trail = missile.querySelector('.trail');
                trail.style.height = `${trailLength+10}px`;
            });


            animationId = window.requestAnimationFrame(step);
        };
        animationId = window.requestAnimationFrame(step);
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