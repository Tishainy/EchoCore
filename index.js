window.onload = function() {
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");

    canvas.width = 500;
    canvas.height = 500;

    var player;
    let bullets = [];
    let enemyBullets = [];
    let enemies = [];
    let gameOver = false;
    let keys = {};
    let score = 0;
    let shootCooldown = 0;
    let enemyShootCooldown = 0;

    // Cargar la imagen del corazón
    var heartImage = new Image();
    heartImage.src = "./img/heart.svg"

    // Player
    class Player {
        constructor() {
            this.x = 240;
            this.y = 240;
            this.width = 20;
            this.height = 20;
            this.lives = 3;
            this.speed = 5;
            this.rotation = 0;
        }

        update() {
            if (this.lives <= 0) {
                gameOver = true;
            }

            // Movimiento con W, A, S, D y flechas
            if (keys["w"] || keys["ArrowUp"]) this.y -= this.speed;
            if (keys["s"] || keys["ArrowDown"]) this.y += this.speed;
            if (keys["a"] || keys["ArrowLeft"]) this.x -= this.speed;
            if (keys["d"] || keys["ArrowRight"]) this.x += this.speed;

            // Mantener dentro del canvas
            this.x = Math.max(0, Math.min(canvas.width - this.width, this.x));
            this.y = Math.max(0, Math.min(canvas.height - this.height, this.y));

            // Incrementar la rotación para girar constantemente
            this.rotation += 0.05;
            if (this.rotation >= 2 * Math.PI) {
                this.rotation = 0;
            }

            // Disparo automático cada 500ms (medio segundo)
            if (shootCooldown <= 0) {
                this.shoot();
                shootCooldown = 200; // Cooldown de 500ms
            } else {
                shootCooldown -= 16; // Disminuir el cooldown (aproximadamente 16ms por cuadro)
            }
        }

        draw() {
            ctx.save();

            ctx.translate(this.x + this.width / 2, this.y + this.height / 2); 
            ctx.rotate(this.rotation);

            ctx.strokeStyle = "black";
            ctx.lineWidth = 3;
            ctx.shadowColor = "rgba(0, 0, 0, 0.4)"; 
            ctx.shadowOffsetX = 10;
            ctx.shadowOffsetY = 10;
            ctx.shadowBlur = 10;

            ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height); 

            ctx.restore();
        }

        shoot() {
            let bullet = new Bullet(this.x + this.width / 2 - 2, this.y);
            bullets.push(bullet);
        }
    }

    // Bullet Class
    class Bullet {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.width = 5;
            this.height = 10;
            this.speed = 5;
        }

        update() {
            this.y -= this.speed;
        }

        draw() {
            ctx.fillStyle = "red";
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    // Enemy Class
    class Enemy {
        constructor() {
            this.x = Math.random() * (canvas.width - 40);
            this.y = -40;
            this.width = 30;
            this.height = 30;
            this.speed = 2 + Math.random() * 2;
            this.rotation = 0;
            this.shootCooldown = 0;
            this.exploding = false;
            this.explosionSize = 0;
            this.opacity = 1;
        }

        update() {
            if (this.exploding) {
                this.explosionSize += 2;  // Increase size over time
                this.opacity -= 0.02;  // Decrease opacity over time

                if (this.opacity <= 0) {
                    const index = enemies.indexOf(this);
                    if (index > -1) {
                        enemies.splice(index, 1);  // Remove from the game after the explosion
                    }
                }
            } else {
                this.y += this.speed;

                this.rotation += 0.05;
                if (this.rotation >= 2 * Math.PI) {
                    this.rotation = 0;
                }

                if (this.shootCooldown <= 0) {
                    this.shoot();
                    this.shootCooldown = 1000; // Cooldown de 1 segundo
                } else {
                    this.shootCooldown -= 16; 
                }

                if (this.y > canvas.height) {
                    const index = enemies.indexOf(this);
                    if (index > -1) {
                        enemies.splice(index, 1);
                    }
                }
            }
        }

        // Enemy draw method update to stroke only on explosion
        draw() {
            ctx.save();
        
            if (this.exploding) {
                // Apply the same rotation as the enemy
                ctx.translate(this.x + this.width / 2, this.y + this.height / 2); // Move to enemy's center
                ctx.rotate(this.rotation);  // Rotate to the enemy's angle
        
                // Draw stroked rectangle with growing size and decreasing opacity
                ctx.strokeStyle = `rgba(128, 128, 128, ${this.opacity})`;  // Gray with decreasing opacity
                ctx.lineWidth = 5;  // Stroke width
                ctx.strokeRect(-this.width / 2 - this.explosionSize / 2, 
                    -this.height / 2 - this.explosionSize / 2, 
                    this.width + this.explosionSize, 
                    this.height + this.explosionSize);
        
                ctx.restore(); // Restore the transformation to the original state
            } else {
                // Create a gradient
                let gradient = ctx.createLinearGradient(0, 0, this.width, this.height);
                gradient.addColorStop(1, "white");  // Starting with light gray (almost white)
                gradient.addColorStop(0., "black");  // Ending with black

                ctx.translate(this.x + this.width / 2, this.y + this.height / 2); 
                ctx.rotate(this.rotation);

                ctx.fillStyle = gradient;
                ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height); 
        
                ctx.restore();
            }
        }

        checkCollision(bullet) {
            return bullet.x < this.x + this.width &&
                bullet.x + bullet.width > this.x &&
                bullet.y < this.y + this.height &&
                bullet.y + bullet.height > this.y;
        }

        shoot() {
            let angleToPlayer = Math.atan2(player.y - this.y, player.x - this.x);
            let spread = 0.2;

            for (let i = -1; i <= 1; i++) {
                let bullet = new EnemyBullet(
                    this.x + this.width / 2 - 2,
                    this.y + this.height,
                    angleToPlayer + i * spread
                );
                enemyBullets.push(bullet);
            }
        }
    }

    // Enemy Bullet Class
    class EnemyBullet {
        constructor(x, y, angle) {
            this.x = x;
            this.y = y;
            this.width = 5;
            this.height = 10;
            this.speed = 3;
            this.angle = angle;
        }

        update() {
            this.x += this.speed * Math.cos(this.angle);
            this.y += this.speed * Math.sin(this.angle);
        }

        draw() {
            ctx.fillStyle = "blue";
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    player = new Player();

    // Crear enemigos aleatorios cada 1.5 segundos
    setInterval(() => {
        enemies.push(new Enemy());
    }, 1500);

    function runGame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        player.update();
        player.draw();

        bullets.forEach((bullet, index) => {
            bullet.update();
            bullet.draw();

            if (bullet.y < 0) {
                bullets.splice(index, 1);
            }
        });

        enemies.forEach((enemy, enemyIndex) => {
            enemy.update();
            enemy.draw();

            bullets.forEach((bullet, bulletIndex) => {
                if (enemy.checkCollision(bullet)) {
                    enemy.exploding = true;  // Trigger explosion effect
                    bullets.splice(bulletIndex, 1);
                    score++;
                }
            });
        });

        enemyBullets.forEach((bullet, index) => {
            bullet.update();
            bullet.draw();

            if (bullet.y > canvas.height || bullet.y < 0 || bullet.x < 0 || bullet.x > canvas.width) {
                enemyBullets.splice(index, 1);
            }

            if (bullet.x < player.x + player.width &&
                bullet.x + bullet.width > player.x &&
                bullet.y < player.y + player.height &&
                bullet.y + bullet.height > player.y) {
                player.lives--;
                enemyBullets.splice(index, 1);
            }
        });

        // Dibujar los corazones en lugar de los números de vidas
        for (let i = 0; i < player.lives; i++) {
            ctx.drawImage(heartImage, 10 + i * 40, 10, 80, 30); // Cambia las posiciones según lo necesites
        }

        ctx.font = "20px Arial";
        ctx.fillStyle = "black";
        ctx.fillText("Score: " + score, canvas.width - 100, 30);

        if (!gameOver) {
            requestAnimationFrame(runGame);
        }
    }

    window.addEventListener("keydown", function(event) {
        keys[event.key] = true;
    });

    window.addEventListener("keyup", function(event) {
        keys[event.key] = false;
    });

    requestAnimationFrame(runGame);
};
