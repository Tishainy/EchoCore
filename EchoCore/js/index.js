import { Player } from './player.js';
import { Bullet, EnemyBullet } from './bullets.js';
import { Enemy } from './enemy.js';

console.log("Index.js loaded");

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 500;
canvas.height = 500;

let keys = {};
window.addEventListener("keydown", (event) => (keys[event.key] = true));
window.addEventListener("keyup", (event) => (keys[event.key] = false));

let player;
let bullets = [];
let enemyBullets = [];
let enemies = [];
let gameOver = false;
let score = 0;
let shootCooldown = 0;
let heartImage = new Image();
heartImage.src = "./img/heart.svg";

// Helper function to check collision between player and enemy
function checkPlayerEnemyCollision(player, enemy) {
    return (
        player.x < enemy.x + enemy.width &&
        player.x + player.width > enemy.x &&
        player.y < enemy.y + enemy.height &&
        player.y + player.height > enemy.y
    );
}

// Generar enemigos cada 1.5 segundos solo después de que inicie el juego
let enemyInterval;

document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && !gameOver) {
        // Ocultar la sección de inicio
        document.getElementById('inicio').style.display = 'none';
        
        // Mostrar la sección del juego
        document.getElementById('game').style.display = 'block';

        // Iniciar el juego
        startGame();
    }
});

document.getElementById('startButton').addEventListener('click', function() {
    // Ocultar la sección del menú
    document.getElementById('menu').style.display = 'none';

    // Mostrar la sección del juego
    document.getElementById('game').style.display = 'block';

    // Iniciar el juego
    startGame();
});

function startGame() {
    // Inicializar todos los elementos cuando empieza el juego
    player = new Player();
    bullets = [];
    enemyBullets = [];
    enemies = [];
    gameOver = false;
    score = 0;

    // Iniciar la generación de enemigos
    enemyInterval = setInterval(() => {
        if (!gameOver) enemies.push(new Enemy());
    }, 1500);

    // Iniciar el ciclo del juego
    runGame();
}

function runGame() {
    if (gameOver) {
        // Detener la generación de enemigos si el juego termina
        clearInterval(enemyInterval);

        // Mostrar el menú después de morir
        setTimeout(() => {
            document.getElementById('game').style.display = 'none';
            document.getElementById('menu').style.display = 'block';
        }, 1000); // 1 segundo de espera para mostrar la transición

        return;
    }

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

        // Check collision with player bullets
        bullets.forEach((bullet, bulletIndex) => {
            if (enemy.checkCollision(bullet)) {
                enemy.exploding = true;
                bullets.splice(bulletIndex, 1);
                score++;
            }
        });

        // Check collision with player
        if (!enemy.exploding && checkPlayerEnemyCollision(player, enemy)) {
            player.lives--;
            enemy.exploding = true; // Optional: make enemy explode on contact
        }
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