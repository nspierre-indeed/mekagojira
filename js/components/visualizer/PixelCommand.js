class PixelCommand {
    static MISSILE_COOLDOWN = 1000;
    static SPEED = 10;
    static ENEMY_SPAWN_SPEED = 5000;

    static startGame(variantShadowDom, paused, animationId) {
        // put a translucent container over the game area to keep clicks/drags from happening on content
        const gameArea = document.createElement('div');
        gameArea.className = 'gameArea';
        variantShadowDom.querySelector('.mainWrapper').appendChild(gameArea);

        // make score area
        const scoreHolder = document.createElement('div');
        scoreHolder.className = 'scoreHolder';
        variantShadowDom.querySelector('.mainWrapper').appendChild(scoreHolder);
        scoreHolder.innerHTML = 'Score: 0';
        let score = 0;
        const addScore = () => {
            score++;
            scoreHolder.innerHTML = `Score: ${score}`;
        };
        const gameOver = () => {
            scoreHolder.innerHTML = `GAME OVER: Final Score ${score}`;
            scoreHolder.classList.add('gameOver');
            paused = true;
        }

        // make towers
        const columns = variantShadowDom.querySelectorAll('section.column');
        let closestTower;
        const makeTower = () => {
            const tower = document.createElement('div');
            tower.className = 'missileTower';
            return tower;
        }
        const towers = [];
        let towersLeft = 0;
        columns.forEach((column) => {
            const tower = makeTower();
            towers.push(tower);
            column.appendChild(tower);
            towersLeft++;
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
            const angle = this.randomIntFromInterval(100, 250);
            enemyMissile.dataset.angle = angle;
            enemyMissile.style.transform = `rotate(${angle}deg)`;
            const randomLeft = this.randomIntFromInterval(30, window.innerWidth - 30);
            enemyMissile.style.top = '0';
            enemyMissile.style.left = `${randomLeft}px`;
            enemyMissile.dataset.origin = `${randomLeft},0`;
            variantShadowDom.appendChild(enemyMissile);
            enemyMissiles.push(enemyMissile);
        };
        
        const checkCollision = (point) => {
            const collisions = [];
            enemyMissiles.forEach((enemyMissile, idx) => {
                const targetX = enemyMissile.style.left;
                const targetY = enemyMissile.style.top;
                const distance = this.getDistance(
                    parseFloat(point.x).toFixed(2),
                    parseFloat(point.y).toFixed(2),
                    parseFloat(targetX).toFixed(2),
                    parseFloat(targetY).toFixed(2));

                if (distance < 30) {
                    collisions.push(idx);
                }
            });
            return collisions;
        };
        const checkHit = (point) => {
            let returnVal = null;
            columns.forEach((column) => {
                if (column.classList.contains('hit') || column.classList.contains('gone')) {
                    return false; // can't hit something if it's already been hit
                }
                const { bottom, left, top, right } = column.getBoundingClientRect();
                if (point.x > left && point.x < right && point.y < bottom && point.y > top) {
                    returnVal = column;
                }
            });
            return returnVal;
        }
        // listeners
        document.addEventListener('mousemove', e => {
            const activeTowers = towers.filter((tower) => {
                return !tower.closest('.column').classList.contains('gone')
            });
            closestTower = activeTowers[0];
            activeTowers.forEach((tower) => {
                tower.classList.remove('closest');
                const towerCenter = this.center(tower);
                let distanceX = Math.abs(e.pageX - towerCenter.x);
                if (distanceX < Math.abs(e.pageX - closestTower.getBoundingClientRect().x)) {
                    if (!tower.classList.contains('gone')) {
                        closestTower = tower;
                    }
                }
                let angle = Math.atan2(e.pageX - towerCenter.x, - (e.pageY - towerCenter.y) )*(180 / Math.PI);
                // convert to circle instead of negative
                if (angle < 0) {
                    angle = 360 + angle;
                }
                tower.dataset.angle = parseFloat(angle).toFixed(2);
            });
        });
        document.addEventListener('mouseup', e => {
            const target = closestTower;
            let mouseNow = Date.now();
            if (target.classList.contains('fired') || target.closest('.column').classList.contains('gone')) {
                return false;
            }
            const towerCenter = this.center(target);
            target.classList.add('fired');
            const missile = makeMissile();
            variantShadowDom.appendChild(missile);
            const offsetAngle = parseFloat(target.dataset.angle) + 90;
            const newPoint = this.findNewPoint(towerCenter.x, towerCenter.y, offsetAngle, -50);
            missile.style.left = `${newPoint.x - (missile.getBoundingClientRect().width / 2)}px`;
            missile.style.top = `${newPoint.y - (missile.getBoundingClientRect().height / 2)}px`;
            missile.dataset.angle = target.dataset.angle;
            missile.dataset.origin = `${missile.style.left},${missile.style.top}`;
            missile.style.transform = `rotate(${missile.dataset.angle}deg)`;
            friendlyMissiles.push(missile);
            target.dataset.lastFired = mouseNow;
        });
        let now = Date.now();
        let then = now;
        let elapsed = 0;

        let lastSpawn = 5000;
        const step = () => {
            then = now;
            now = Date.now();
            elapsed = now - then;
            if (paused) {
                requestAnimationFrame(step);
                return;
            }
            if (lastSpawn < 1) {
                makeEnemyMissile();
                const difficultyCurve = score * 20;
                lastSpawn = (difficultyCurve < this.ENEMY_SPAWN_SPEED / 2) ? this.ENEMY_SPAWN_SPEED - (score * 10) : this.ENEMY_SPAWN_SPEED / 2;
            } else {
                lastSpawn -= elapsed;
            }

            // move active missile tower
            if (closestTower) {
                closestTower.style.transform = `rotate(${closestTower.dataset.angle}deg)`;
                closestTower.classList.add('closest');
            }

            // remove fired class on towers fired more than a second ago
            towers.forEach((tower) => {
                if (now - tower?.dataset?.lastFired > this.MISSILE_COOLDOWN) {
                    tower.classList.remove('fired');
                }
            });

            const moveDistance = (elapsed * this.SPEED) / 33.3; // number of pixels per frame, or 33.3 ms. 
            enemyMissiles.forEach((missile, index) => {
                const origin = missile.dataset.origin.split(',');
                const [ originX, originY ] = origin;
                const oldPoint = {
                    x: parseFloat(missile.style.left),
                    y: parseFloat(missile.style.top)
                };
                const hitColumn = checkHit(oldPoint);
                if (hitColumn && !hitColumn.classList.contains('hit')) {
                    hitColumn.classList.add('hit');
                    setTimeout(() => {
                        hitColumn.classList.add('gone');
                        towersLeft--;
                        if (towersLeft < 1) {
                            gameOver();
                        }
                    }, 4500);
                }
                if (hitColumn || oldPoint.y > window.innerHeight - 30 || oldPoint.x < 1 || oldPoint.x > window.innerWidth - 30) {
                    enemyMissiles.splice(index, 1);
                    variantShadowDom.removeChild(missile);
                    return;
                }
                const offsetAngle = parseFloat(missile.dataset.angle) + 90;
                const newPoint = this.findNewPoint(oldPoint.x, oldPoint.y, offsetAngle, -1 * (moveDistance / 2 ));
                missile.style.left = `${newPoint.x}px`;
                missile.style.top = `${newPoint.y}px`;
                const trailLength = this.getDistance(parseFloat(originX).toFixed(2), parseFloat(originY).toFixed(2), newPoint.x, newPoint.y);
                const trail = missile.querySelector('.trail');
                trail.style.height = `${trailLength}px`;
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
                        const explosionDiv = document.createElement('div');
                        explosionDiv.className = 'explosion';
                        explosionDiv.style.left = missile.style.left;
                        explosionDiv.style.top = missile.style.top;
                        variantShadowDom.appendChild(explosionDiv);
                        window.setTimeout(() => {
                            variantShadowDom.removeChild(explosionDiv);
                        }, 2500);
                        addScore();
                    });
                }
                if (collisions.length > 0 || oldPoint.y < 1 || oldPoint.x < 1 || oldPoint.x > window.innerWidth - 30) {
                    friendlyMissiles.splice(index, 1);
                    variantShadowDom.removeChild(missile);
                    return;
                }
                const offsetAngle = parseFloat(missile.dataset.angle) + 90;
                const newPoint = this.findNewPoint(oldPoint.x, oldPoint.y, offsetAngle, -1 * moveDistance);
                missile.style.left = `${newPoint.x}px`;
                missile.style.top = `${newPoint.y}px`;
                const trailLength = this.getDistance(parseFloat(originX), parseFloat(originY).toFixed(2), newPoint.x, newPoint.y);
                const trail = missile.querySelector('.trail');
                trail.style.height = `${trailLength+10}px`;
            });


            animationId = window.requestAnimationFrame(step);
        };
        animationId = window.requestAnimationFrame(step);
    }

    // static util functions, must be pure and only rely on core js libraries and input

    // TODO: might simplify some logic using this const mid_point = ([x1, y1], [x2, y2]) => [(x1 + x2) / 2, (y1 + y2) / 2];

    static randomIntFromInterval(min, max) { // min and max included 
        return Math.floor(Math.random() * (max - min + 1) + min)
    }

    static center(target) {
        const rect = target.getBoundingClientRect();
        return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };
    }

    static findNewPoint(x, y, angle, distance) {
        const result = {};
    
        result.x = Math.cos((angle) * Math.PI / 180) * distance + x;
        result.x = parseFloat(result.x).toFixed(2);
        result.y = Math.sin((angle) * Math.PI / 180) * distance + y;
        result.y = parseFloat(result.y).toFixed(2);
        return result;
    }

    static getDistance(x1, y1, x2, y2) {
        let y = Math.abs(x2 - x1);
        let x = Math.abs(y2 - y1);
        return Math.sqrt(x * x + y * y);
    }
};

export default PixelCommand;