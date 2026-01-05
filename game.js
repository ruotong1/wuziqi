// 游戏画布和上下文
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

// 游戏状态
let gameState = {
    score: 0,
    lives: 3,
    enemiesRemaining: 10,
    gameOver: false,
    keys: {}
};

// 游戏对象数组
let player = null;
let enemies = [];
let bullets = [];
let enemyBullets = [];

// 坦克类
class Tank {
    constructor(x, y, color, isPlayer = false) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.color = color;
        this.angle = 0;
        this.speed = isPlayer ? 3 : 1.5;
        this.rotationSpeed = 0.05;
        this.isPlayer = isPlayer;
        this.health = isPlayer ? 3 : 1;
        this.lastShot = 0;
        this.shootCooldown = isPlayer ? 300 : 2000;
        this.direction = Math.random() * Math.PI * 2; // 敌人坦克的移动方向
        this.directionChangeTime = 0;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.angle);

        // 绘制坦克主体
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

        // 绘制坦克炮管
        ctx.fillStyle = '#333';
        ctx.fillRect(this.width / 2 - 5, -3, 20, 6);

        // 绘制坦克细节
        ctx.fillStyle = '#555';
        ctx.fillRect(-this.width / 2 + 5, -this.height / 2 + 5, this.width - 10, this.height - 10);

        ctx.restore();
    }

    update() {
        if (this.isPlayer) {
            this.handlePlayerInput();
        } else {
            this.handleEnemyAI();
        }
    }

    handlePlayerInput() {
        let moved = false;

        // 移动控制
        if (gameState.keys['w'] || gameState.keys['ArrowUp']) {
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;
            moved = true;
        }
        if (gameState.keys['s'] || gameState.keys['ArrowDown']) {
            this.x -= Math.cos(this.angle) * this.speed;
            this.y -= Math.sin(this.angle) * this.speed;
            moved = true;
        }

        // 旋转控制
        if (gameState.keys['a'] || gameState.keys['ArrowLeft']) {
            this.angle -= this.rotationSpeed;
        }
        if (gameState.keys['d'] || gameState.keys['ArrowRight']) {
            this.angle += this.rotationSpeed;
        }

        // 边界检测
        this.x = Math.max(0, Math.min(canvas.width - this.width, this.x));
        this.y = Math.max(0, Math.min(canvas.height - this.height, this.y));

        // 射击
        if (gameState.keys[' '] && Date.now() - this.lastShot > this.shootCooldown) {
            this.shoot();
            this.lastShot = Date.now();
        }
    }

    handleEnemyAI() {
        // 定期改变方向
        if (Date.now() - this.directionChangeTime > 2000) {
            this.direction = Math.random() * Math.PI * 2;
            this.directionChangeTime = Date.now();
        }

        // 朝向玩家
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const targetAngle = Math.atan2(dy, dx);
        
        // 平滑旋转
        let angleDiff = targetAngle - this.angle;
        while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
        
        this.angle += angleDiff * 0.05;

        // 移动
        this.x += Math.cos(this.direction) * this.speed;
        this.y += Math.sin(this.direction) * this.speed;

        // 边界检测和反弹
        if (this.x <= 0 || this.x >= canvas.width - this.width) {
            this.direction = Math.PI - this.direction;
        }
        if (this.y <= 0 || this.y >= canvas.height - this.height) {
            this.direction = -this.direction;
        }
        this.x = Math.max(0, Math.min(canvas.width - this.width, this.x));
        this.y = Math.max(0, Math.min(canvas.height - this.height, this.y));

        // 随机射击
        if (Math.random() < 0.005 && Date.now() - this.lastShot > this.shootCooldown) {
            this.shoot(true);
            this.lastShot = Date.now();
        }
    }

    shoot(isEnemy = false) {
        const bulletX = this.x + this.width / 2 + Math.cos(this.angle) * (this.width / 2 + 10);
        const bulletY = this.y + this.height / 2 + Math.sin(this.angle) * (this.height / 2 + 10);
        
        if (isEnemy) {
            enemyBullets.push(new Bullet(bulletX, bulletY, this.angle, '#ff4444', true));
        } else {
            bullets.push(new Bullet(bulletX, bulletY, this.angle, '#44ff44', false));
        }
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

// 子弹类
class Bullet {
    constructor(x, y, angle, color, isEnemy) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = 5;
        this.radius = 4;
        this.color = color;
        this.isEnemy = isEnemy;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // 添加光晕效果
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
    }

    isOffScreen() {
        return this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height;
    }

    getBounds() {
        return {
            x: this.x - this.radius,
            y: this.y - this.radius,
            width: this.radius * 2,
            height: this.radius * 2
        };
    }
}

// 碰撞检测
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// 初始化游戏
function initGame() {
    player = new Tank(canvas.width / 2, canvas.height / 2, '#4CAF50', true);
    enemies = [];
    bullets = [];
    enemyBullets = [];
    
    // 创建敌人坦克
    for (let i = 0; i < 10; i++) {
        let x, y;
        do {
            x = Math.random() * (canvas.width - 30);
            y = Math.random() * (canvas.height - 30);
        } while (Math.abs(x - player.x) < 100 && Math.abs(y - player.y) < 100);
        
        enemies.push(new Tank(x, y, '#e74c3c', false));
    }
    
    gameState.score = 0;
    gameState.lives = 3;
    gameState.enemiesRemaining = 10;
    gameState.gameOver = false;
    
    updateUI();
    document.getElementById('gameOver').classList.add('hidden');
}

// 更新UI
function updateUI() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('lives').textContent = gameState.lives;
    document.getElementById('enemies').textContent = gameState.enemiesRemaining;
}

// 游戏循环
function gameLoop() {
    if (gameState.gameOver) return;

    // 清空画布
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制网格背景
    ctx.strokeStyle = '#34495e';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 40) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }

    // 更新和绘制玩家
    if (player) {
        player.update();
        player.draw();
    }

    // 更新和绘制敌人
    enemies.forEach((enemy, index) => {
        enemy.update();
        enemy.draw();
    });

    // 更新和绘制子弹
    bullets.forEach((bullet, index) => {
        bullet.update();
        bullet.draw();

        // 检查子弹是否击中敌人
        enemies.forEach((enemy, enemyIndex) => {
            if (checkCollision(bullet.getBounds(), enemy.getBounds())) {
                bullets.splice(index, 1);
                enemies.splice(enemyIndex, 1);
                gameState.score += 100;
                gameState.enemiesRemaining--;
                updateUI();
            }
        });

        // 移除屏幕外的子弹
        if (bullet.isOffScreen()) {
            bullets.splice(index, 1);
        }
    });

    // 更新和绘制敌人子弹
    enemyBullets.forEach((bullet, index) => {
        bullet.update();
        bullet.draw();

        // 检查子弹是否击中玩家
        if (player && checkCollision(bullet.getBounds(), player.getBounds())) {
            enemyBullets.splice(index, 1);
            gameState.lives--;
            updateUI();
            
            if (gameState.lives <= 0) {
                endGame();
            }
        }

        // 移除屏幕外的子弹
        if (bullet.isOffScreen()) {
            enemyBullets.splice(index, 1);
        }
    });

    // 检查游戏胜利条件
    if (gameState.enemiesRemaining <= 0) {
        gameState.score += 500; // 胜利奖励
        updateUI();
        setTimeout(() => {
            alert('恭喜！你消灭了所有敌人！');
            initGame();
        }, 500);
    }

    requestAnimationFrame(gameLoop);
}

// 游戏结束
function endGame() {
    gameState.gameOver = true;
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('gameOver').classList.remove('hidden');
}

// 键盘事件
document.addEventListener('keydown', (e) => {
    gameState.keys[e.key.toLowerCase()] = true;
    if (e.key === 'r' || e.key === 'R') {
        initGame();
    }
});

document.addEventListener('keyup', (e) => {
    gameState.keys[e.key.toLowerCase()] = false;
});

// 重新开始按钮
document.getElementById('restartBtn').addEventListener('click', () => {
    initGame();
    gameState.gameOver = false;
    requestAnimationFrame(gameLoop);
});

// 启动游戏
initGame();
gameLoop();


