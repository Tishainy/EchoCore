import { Player } from './player.js';
import { Bullet, EnemyBullet, BossBullet } from './bullets.js';
import { Enemy, Boss } from './enemy.js';

console.log("Index.js loaded");

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 500;
canvas.height = 500;

const inicioCanvas = document.getElementById("inicioCanvas");
const inicioCtx = inicioCanvas.getContext("2d");
inicioCanvas.width = 500;
inicioCanvas.height = 500;

let keys = {};
window.addEventListener("keydown", (event) => (keys[event.key] = true));
window.addEventListener("keyup", (event) => (keys[event.key] = false));

let player;
let bullets = [];
let enemyBullets = [];
let enemies = [];
let boss = null;
let gameOver = false;
let score = 0;
let shootCooldown = 0;
let heartImage = new Image();
heartImage.src = "./img/heart.svg";

let showTip = true;
let blinkStartTime = 0;
let blinkDuration = 5000;
let isBlinking = true;
let gameRunning = false; // New flag to track if the game is already running
let animationFrameId = null; // To store the requestAnimationFrame ID

function checkPlayerEnemyCollision(player, enemy) {
    return (
        player.x < enemy.x + enemy.width &&
        player.x + player.width > enemy.x &&
        player.y < enemy.y + enemy.height &&
        player.y + player.height > enemy.y
    );
}

let enemyInterval;

document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && !gameOver && !gameRunning) { // Only start if not already running
        document.getElementById('inicio').style.display = 'none';
        document.getElementById('game').style.display = 'block';
        startGame();
    }
});

document.getElementById('startButton').addEventListener('click', function() {
    if (!gameRunning) { // Only start if not already running
        document.getElementById('menu').style.display = 'none';
        document.getElementById('game').style.display = 'block';
        startGame();
    }
});

function startGame() {
    // Cancel any existing animation frame to prevent multiple loops
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }

    player = new Player();
    bullets = [];
    enemyBullets = [];
    enemies = [];
    boss = null;
    gameOver = false;
    score = 0;
    gameRunning = true; // Set flag to true when game starts

    // Clear any existing enemy interval
    if (enemyInterval) {
        clearInterval(enemyInterval);
    }
    enemyInterval = setInterval(() => {
        if (!gameOver && !boss && score < 1000) {
            enemies.push(new Enemy());
        }
    }, 1500);

    runGame();
}

function drawTip(ctx, canvas) {
    if (showTip) {
        let opacity = isBlinking ? 1 : 0;
        ctx.save();
        ctx.font = "20px Arial";
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Presiona J para Concentración", canvas.width / 2, canvas.height - 30);
        ctx.restore();
    }
}

function runGame() {
    if (gameOver) {
        clearInterval(enemyInterval);
        setTimeout(() => {
            document.getElementById('game').style.display = 'none';
            document.getElementById('menu').style.display = 'block';
            gameRunning = false; // Reset flag when game ends
        }, 1000);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawTip(ctx, canvas);
    if (Date.now() - blinkStartTime > blinkDuration) {
        showTip = false;
    }

    if (keys['j']) {
        player.size = 20;
        player.speed = 2;
    } else {
        player.size = 40;
        player.speed = 4;
    }

    shootCooldown = player.update(keys, shootCooldown, bullets, canvas);
    player.draw(ctx);
    if (player.lives <= 0) gameOver = true;

    bullets.forEach((bullet, index) => {
        bullet.update();
        bullet.draw(ctx);
        if (bullet.y < 0) bullets.splice(index, 1);
    });

    if (score >= 1000 && !boss && !gameOver) {
        boss = new Boss();
        enemies = [];
        clearInterval(enemyInterval);
        console.log("Boss spawned!");
    }

    enemies.forEach((enemy, enemyIndex) => {
        const shouldRemove = enemy.update(player, enemyBullets, canvas, keys['j']);
        enemy.draw(ctx);
        if (shouldRemove) enemies.splice(enemyIndex, 1);

        bullets.forEach((bullet, bulletIndex) => {
            if (enemy.checkCollision(bullet)) {
                enemy.exploding = true;
                bullets.splice(bulletIndex, 1);
                score += 100;
            }
        });

        if (!enemy.exploding && checkPlayerEnemyCollision(player, enemy)) {
            player.lives--;
            enemy.exploding = true;
        }
    });

    if (boss) {
        const bossRemoved = boss.update(player, enemyBullets, canvas, keys['j']);
        boss.draw(ctx);
        if (bossRemoved) {
            console.log("Boss defeated! Opacity reached 0, setting gameOver to true.");
            boss = null;
            gameOver = true;
            score += 500;
        } else if (boss.exploding) {
            console.log("Boss exploding, opacity:", boss.opacity);
        }

        bullets.forEach((bullet, bulletIndex) => {
            if (boss && boss.checkCollision(bullet)) {
                bullets.splice(bulletIndex, 1);
                score += 50;
            }
        });

        if (boss && !boss.exploding && checkPlayerEnemyCollision(player, boss)) {
            player.lives--;
        }
    }

    enemyBullets.forEach((bullet, index) => {
        bullet.update();
        bullet.draw(ctx);

        if (bullet instanceof BossBullet) {
            if (
                (bullet.bounces >= bullet.maxBounces &&
                 (bullet.y > canvas.height || bullet.y < 0 || bullet.x < 0 || bullet.x > canvas.width)) ||
                bullet.hasExpired()
            ) {
                enemyBullets.splice(index, 1);
            }
        } else {
            if (
                bullet.y > canvas.height ||
                bullet.y < 0 ||
                bullet.x < 0 ||
                bullet.x > canvas.width
            ) {
                enemyBullets.splice(index, 1);
            }
        }

        if (
            bullet.x < player.x + player.width &&
            bullet.x + bullet.width > player.x &&
            bullet.y < player.y + player.height &&
            bullet.y + bullet.height > player.y
        ) {
            player.lives--;
            enemyBullets.splice(index, 1);
        }
    });

    for (let i = 0; i < player.lives; i++) {
        ctx.drawImage(heartImage, 10 + i * 40, 10, 80, 30);
    }
    ctx.font = "20px Arial";
    ctx.fillStyle = "black";
    ctx.fillText("Score: " + score, canvas.width - 100, 30);

    animationFrameId = requestAnimationFrame(runGame); // Store the frame ID
}

let angle = 0;
function drawRotatingSquare() {
    inicioCtx.clearRect(0, 0, inicioCanvas.width, inicioCanvas.height);
    inicioCtx.translate(inicioCanvas.width / 2, inicioCanvas.height / 2);
    inicioCtx.rotate(angle);
    inicioCtx.shadowColor = "rgba(0, 0, 0, 0.5)";
    inicioCtx.shadowBlur = 7;
    inicioCtx.shadowOffsetX = 35;
    inicioCtx.shadowOffsetY = 35;
    inicioCtx.strokeStyle = "black";
    inicioCtx.lineWidth = 24;
    inicioCtx.strokeRect(-75, -75, 150, 150);
    inicioCtx.shadowColor = "transparent";
    inicioCtx.shadowBlur = 0;
    inicioCtx.shadowOffsetX = 0;
    inicioCtx.shadowOffsetY = 0;
    inicioCtx.rotate(-angle);
    inicioCtx.translate(-inicioCanvas.width / 2, -inicioCanvas.height / 2);
    angle += 0.01;
}

function animate() {
    drawRotatingSquare();
    requestAnimationFrame(animate);
}

animate();
blinkStartTime = Date.now();