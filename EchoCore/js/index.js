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

let totalPoints = 0;

let upgrades = {
    damage: 0,
    speed: 0,
    columns: 0
};

const powerupCosts = {
    damage: [1000, 1000, 1000],
    speed: [1000, 1000, 1000],
    columns: [1000, 1000, 1000]
};

let keys = {};
window.addEventListener("keydown", (event) => { keys[event.key] = true; });
window.addEventListener("keyup", (event) => { keys[event.key] = false; });

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
let gameRunning = false;
let animationFrameId = null;

let shakeDuration = 0;
const shakeIntensity = 3;

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
    if (event.key === 'Enter' && !gameOver && !gameRunning) {
        document.getElementById('inicio').style.display = 'none';
        document.getElementById('game').style.display = 'block';

        // Música de fondo
        const music = document.getElementById("bg-music");
        music.volume = 0.5;
        music.play().catch(() => {
            console.log("El navegador bloqueó el autoplay. Necesita interacción.");
        });

        startGame();
    }
});

document.getElementById('startButton').addEventListener('click', function() {
    if (!gameRunning) {
        document.getElementById('menu').style.display = 'none';
        document.getElementById('game').style.display = 'block';
        startGame();
    }
});
document.getElementById('restartButton').addEventListener('click', function() {
    // Reinicia el estado del juego
    gameRunning = false;
    gameOver = false;
    score = 0;
    totalPoints = 0;
    upgrades = { damage: 0, speed: 0, columns: 0 };

    // Limpia el canvas del juego, pero no el canvas del inicio
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Oculta el menú y muestra la pantalla de inicio
    document.getElementById('menu').style.display = 'none';
    document.getElementById('game').style.display = 'block';

    // Reinicia el texto de puntos
    document.querySelector('.points').textContent = totalPoints;

    // Restablece los Power-Ups en el DOM
    document.querySelectorAll('.list-damage li, .list-speed li, .list-columns li').forEach((li) => {
        li.style.display = 'none'; // Oculta todos los niveles
    });
    document.querySelector('.damage-l').style.display = 'block'; // Muestra el nivel inicial
    document.querySelector('.speed-l').style.display = 'block'; // Muestra el nivel inicial
    document.querySelector('.columns-l').style.display = 'block'; // Muestra el nivel inicial

    // Detén cualquier animación en curso
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    startGame()
    console.log("Game reset. Ready to start again.");
});


function startGame() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }

    player = new Player();
    player.damageLevel = 1 + upgrades.damage;
    player.columns = 1 + upgrades.columns;
    bullets = [];
    enemyBullets = [];
    enemies = [];
    boss = null;
    gameOver = false;
    score = 0;
    gameRunning = true;

    if (enemyInterval) {
        clearInterval(enemyInterval);
    }
    enemyInterval = setInterval(() => {
        if (!gameOver && !boss && score < 1000 && enemies.length < 5) {
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
        ctx.fillText("Press J for Focus Mode", canvas.width / 2, canvas.height - 30);
        ctx.restore();
    }
}

function runGame() {
    if (gameOver) {
        clearInterval(enemyInterval);
        totalPoints += score;
        document.querySelector('.points').textContent = totalPoints;
        
        setTimeout(() => {
            document.getElementById('game').style.display = 'none';
            document.getElementById('menu').style.display = 'block';
            gameRunning = false;
        }, 1000);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    if (shakeDuration > 0) {
        const shakeX = (Math.random() - 0.5) * shakeIntensity * 2;
        const shakeY = (Math.random() - 0.5) * shakeIntensity * 2;
        ctx.translate(shakeX, shakeY);
        shakeDuration--;
    }

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

    shootCooldown = player.update(keys, shootCooldown, bullets, canvas, upgrades.speed);
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
                if (!enemy.exploding) {
                    enemy.exploding = true;
                    score += 100;
                }
                bullets.splice(bulletIndex, 1);
            }
        });

        if (!enemy.exploding && checkPlayerEnemyCollision(player, enemy)) {
            player.lives--;
            enemy.exploding = true;
            shakeDuration = 10;
        }
    });

    if (boss) {
        const bossRemoved = boss.update(player, enemyBullets, canvas, keys['j']);
        boss.draw(ctx);
        if (bossRemoved) {
            console.log("Boss defeated!");
            boss = null;
            gameOver = true;
            score += 500;
        } else if (boss.exploding && shakeDuration === 0) {
            shakeDuration = 15;
        }

        bullets.forEach((bullet, bulletIndex) => {
            if (boss && boss.checkCollision(bullet)) {
                boss.health -= bullet.damage;
                if (!boss.exploding) {
                    score += 50; // Only award points if not exploding
                }
                bullets.splice(bulletIndex, 1);
                if (boss.health <= 0 && !boss.exploding) {
                    boss.exploding = true;
                    shakeDuration = 15;
                }
            }
        });

        if (boss && !boss.exploding && checkPlayerEnemyCollision(player, boss)) {
            player.lives--;
            shakeDuration = 10;
        }
    }

    enemyBullets.forEach((bullet, index) => {
        bullet.update();
        bullet.draw(ctx);

        // Only remove BossBullets based on lifetime or full fade-out, not position
        if (bullet instanceof BossBullet) {
            if (bullet.hasExpired()) {
                enemyBullets.splice(index, 1);
            }
        } else {
            // Regular EnemyBullets still remove when out of bounds
            if (
                bullet.y > canvas.height ||
                bullet.y < 0 ||
                bullet.x < 0 ||
                bullet.x > canvas.width
            ) {
                enemyBullets.splice(index, 1);
            }
        }

        // Player collision check
        if (
            bullet.x < player.x + player.width &&
            bullet.x + bullet.width > player.x &&
            bullet.y < player.y + player.height &&
            bullet.y + bullet.height > player.y
        ) {
            player.lives--;
            enemyBullets.splice(index, 1);
            shakeDuration = 10;
            const hurtSound = new Audio('./music/hurt.mp3'); // Asegúrate de que el archivo esté en la ruta correcta
            hurtSound.volume = 0.8; // Ajusta el volumen si es necesario
            hurtSound.play().catch(() => {
            console.log("El navegador bloqueó el autoplay. Necesita interacción.");
        });
        }
    });

    for (let i = 0; i < player.lives; i++) {
        ctx.drawImage(heartImage, 10 + i * 40, 10, 80, 30);
    }
    ctx.font = "20px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "right";
    ctx.fillText("Score: " + score, canvas.width - 20, 30);

    ctx.restore();

    animationFrameId = requestAnimationFrame(runGame);
}

let angle = 0;
function drawRotatingSquare() {
    inicioCtx.clearRect(0, 0, inicioCanvas.width, inicioCanvas.height);
    inicioCtx.save();
    inicioCtx.translate(inicioCanvas.width / 2, inicioCanvas.height / 2);
    inicioCtx.rotate(angle);
    inicioCtx.shadowColor = "rgba(0, 0, 0, 0.5)";
    inicioCtx.shadowBlur = 7;
    inicioCtx.shadowOffsetX = 35;
    inicioCtx.shadowOffsetY = 35;
    inicioCtx.strokeStyle = "black";
    inicioCtx.lineWidth = 24;
    inicioCtx.strokeRect(-75, -75, 150, 150);
    inicioCtx.restore();
    angle += 0.01;
}

function animate() {
    drawRotatingSquare();
    requestAnimationFrame(animate);
}

animate();
blinkStartTime = Date.now();

document.querySelector('.points').textContent = totalPoints;

document.querySelectorAll('.damage-btn, .speed-btn, .columns-btn').forEach(button => {
    button.addEventListener('click', () => {
        const currentLi = button.closest('li');
        const costSpan = button.querySelector('.max');
        let type, nextLevel;

        if (currentLi.classList.contains('damage-l')) {
            type = 'damage';
            nextLevel = 1;           
        } else if (currentLi.classList.contains('damage-ll')) {
            type = 'damage';
            nextLevel = 2;
        } else if (currentLi.classList.contains('damage-lll')) {
            type = 'damage';
            nextLevel = 3;
            costSpan.textContent = 'MAX';
        } else if (currentLi.classList.contains('speed-l')) {
            type = 'speed';
            nextLevel = 1;
        } else if (currentLi.classList.contains('speed-ll')) {
            type = 'speed';
            nextLevel = 2;
        } else if (currentLi.classList.contains('speed-lll')) {
            type = 'speed';
            nextLevel = 3;
            costSpan.textContent = 'MAX';
        } else if (currentLi.classList.contains('columns-l')) {
            type = 'columns';
            nextLevel = 1;
        } else if (currentLi.classList.contains('columns-ll')) {
            type = 'columns';
            nextLevel = 2;
        } else if (currentLi.classList.contains('columns-lll')) {
            type = 'columns';
            nextLevel = 3;
            costSpan.textContent = 'MAX';
        }

        if (upgrades[type] >= 3) {
            return;
        }

        const cost = powerupCosts[type][nextLevel - 1];
        if (totalPoints < cost) {
            console.log(`Not enough points for ${type} level ${nextLevel}! Need ${cost}, have ${totalPoints}`);
            currentLi.classList.add('insufficient', 'shaking');
            setTimeout(() => {
                currentLi.classList.remove('insufficient', 'shaking');
            }, 300);

            // Reproducir el sonido 'nopowerups.mp3' si no tienes suficientes puntos
            const noPowerUpSound = new Audio('./music/noPoints.mp3');
            noPowerUpSound.volume = 0.3; // Ajusta el volumen según lo que quieras
            noPowerUpSound.play().catch(() => {
                console.log("El navegador bloqueó el autoplay. Necesita interacción.");
            });

            return;
        }

        totalPoints -= cost;
        upgrades[type] = nextLevel;
        document.querySelector('.points').textContent = totalPoints;

        const powerUpSound = new Audio('./music/powerUps.mp3');
    	powerUpSound.volume = 0.5; // Ajusta el volumen según lo que quieras
    	powerUpSound.play().catch(() => {
    	    console.log("El navegador bloqueó el autoplay. Necesita interacción.");
    	});

        if (type === 'damage') {
            if (currentLi.classList.contains('damage-l')) {
                currentLi.style.display = 'none';
                document.querySelector('.damage-ll').style.display = 'block';
            } else if (currentLi.classList.contains('damage-ll')) {
                currentLi.style.display = 'none';
                document.querySelector('.damage-lll').style.display = 'block';
            }
        } else if (type === 'speed') {
            if (currentLi.classList.contains('speed-l')) {
                currentLi.style.display = 'none';
                document.querySelector('.speed-ll').style.display = 'block';
            } else if (currentLi.classList.contains('speed-ll')) {
                currentLi.style.display = 'none';
                document.querySelector('.speed-lll').style.display = 'block';
            }
        } else if (type === 'columns') {
            if (currentLi.classList.contains('columns-l')) {
                currentLi.style.display = 'none';
                document.querySelector('.columns-ll').style.display = 'block';
            } else if (currentLi.classList.contains('columns-ll')) {
                currentLi.style.display = 'none';
                document.querySelector('.columns-lll').style.display = 'block';
            }
        }

        console.log(`Purchased ${type} level ${nextLevel} for ${cost} points. Remaining: ${totalPoints}`);
    });
});