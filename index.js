import { Player } from './player.js';
import { Bullet, EnemyBullet } from './bullets.js';
import { Enemy } from './enemy.js';

console.log("Index.js loaded");

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = 500;
canvas.height = 500;

let keys = {};
window.addEventListener("keydown", (event) => (keys[event.key] = true));
window.addEventListener("keyup", (event) => (keys[event.key] = false));

let player = new Player();
let bullets = [];
let enemyBullets = [];
let enemies = [];
let gameOver = false;
let score = 0;
let shootCooldown = 0;
let heartImage = new Image();
heartImage.src = "./img/heart.svg";

setInterval(() => {
    if (!gameOver) enemies.push(new Enemy());
}, 1500);

function runGame() {
    if (gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update player
    shootCooldown = player.update(keys, shootCooldown, bullets, canvas);
    player.draw(ctx);
    if (player.lives <= 0) gameOver = true;

    // Update and draw bullets
    bullets.forEach((bullet, index) => {
        bullet.update();
        bullet.draw(ctx);
        if (bullet.y < 0) bullets.splice(index, 1);
    });

    // Update and draw enemies
    enemies.forEach((enemy, enemyIndex) => {
        const shouldRemove = enemy.update(player, enemyBullets, canvas);
        enemy.draw(ctx);
        if (shouldRemove) enemies.splice(enemyIndex, 1);

        bullets.forEach((bullet, bulletIndex) => {
            if (enemy.checkCollision(bullet)) {
                enemy.exploding = true;
                bullets.splice(bulletIndex, 1);
                score++;
            }
        });
    });

    // Update and draw enemy bullets
    enemyBullets.forEach((bullet, index) => {
        bullet.update();
        bullet.draw(ctx);
        if (
            bullet.y > canvas.height ||
            bullet.y < 0 ||
            bullet.x < 0 ||
            bullet.x > canvas.width
        ) {
            enemyBullets.splice(index, 1);
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

    // Draw UI
    for (let i = 0; i < player.lives; i++) {
        ctx.drawImage(heartImage, 10 + i * 40, 10, 80, 30);
    }
    ctx.font = "20px Arial";
    ctx.fillStyle = "black";
    ctx.fillText("Score: " + score, canvas.width - 100, 30);

    requestAnimationFrame(runGame);
}

runGame();