window.onload = function() {
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");

    canvas.width = 500;
    canvas.height = 500;

    var player;
    let bullets = [];
    let enemyBullets = []; // Store enemy bullets
    let enemies = [];
    let gameOver = false;
    let keys = {}; // Guardará el estado de las teclas presionadas
    let score = 0; // -- Contador de enemigos eliminados
    let shootCooldown = 0; // Shooting cooldown timer
    let enemyShootCooldown = 0; // Enemy shooting cooldown timer

    // Player
    class Player {
        constructor() {
            this.x = 240;
            this.y = 240;
            this.width = 20;
            this.height = 20;
            this.lives = 3;
            this.speed = 5;
            this.rotation = 0; // Add rotation property
        }

        update() {
            if (this.lives <= 0) {
                gameOver = true;
            }

            // Movimiento con W, A, S, D y flechas
            if (keys["w"] || keys["ArrowUp"]) this.y -= this.speed; // Arriba
            if (keys["s"] || keys["ArrowDown"]) this.y += this.speed; // Abajo
            if (keys["a"] || keys["ArrowLeft"]) this.x -= this.speed; // Izquierda
            if (keys["d"] || keys["ArrowRight"]) this.x += this.speed; // Derecha

            // Mantener dentro del canvas
            this.x = Math.max(0, Math.min(canvas.width - this.width, this.x));
            this.y = Math.max(0, Math.min(canvas.height - this.height, this.y));

            // Increment the rotation for continuous spinning
            this.rotation += 0.05;
            if (this.rotation >= 2 * Math.PI) {
                this.rotation = 0; // Reset after full rotation
            }

            // Automatic shooting every 500ms (half a second)
            if (shootCooldown <= 0) {
                this.shoot();
                shootCooldown = 200; // Set cooldown to 500ms
            } else {
                shootCooldown -= 16; // Decrease cooldown (roughly 16ms per frame)
            }
        }

        draw() {
            ctx.save(); // Save the current context state

            ctx.translate(this.x + this.width / 2, this.y + this.height / 2); // Move to the center of the player
            ctx.rotate(this.rotation); // Apply rotation

            ctx.strokeStyle = "black";
            ctx.lineWidth = 3;
        
            // Apply shadow settings
            ctx.shadowColor = "rgba(0, 0, 0, 0.4)"; // Black with 20% opacity
            ctx.shadowOffsetX = 10;
            ctx.shadowOffsetY = 10;
            ctx.shadowBlur = 10; 

            ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height); // Draw centered

            ctx.restore(); // Restore the context to avoid affecting other objects
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
            this.x = Math.random() * (canvas.width - 40); // Genera una posición aleatoria en el eje X
            this.y = -40; // Aparece arriba del canvas
            this.width = 40; // Aumenta el tamaño
            this.height = 40; // Aumenta el tamaño
            this.speed = 2 + Math.random() * 2; // Velocidad aleatoria de caída
            this.rotation = 0; // Add rotation property
            this.shootCooldown = 0; // Enemy shooting cooldown
        }

        update() {
            this.y += this.speed; // Mueve al enemigo hacia abajo

            // Increment the rotation for continuous spinning
            this.rotation += 0.05;
            if (this.rotation >= 2 * Math.PI) {
                this.rotation = 0; // Reset after full rotation
            }

            // If it's time for the enemy to shoot, shoot 3 bullets
            if (this.shootCooldown <= 0) {
                this.shoot();
                this.shootCooldown = 1000; // Set cooldown to 1 second
            } else {
                this.shootCooldown -= 16; // Decrease cooldown (roughly 16ms per frame)
            }

            // Si el enemigo se sale del canvas, lo eliminamos
            if (this.y > canvas.height) {
                const index = enemies.indexOf(this);
                if (index > -1) {
                    enemies.splice(index, 1);
                }
            }
        }

        draw() {
            ctx.save(); // Save the current context state

            ctx.translate(this.x + this.width / 2, this.y + this.height / 2); // Move to the center of the enemy
            ctx.rotate(this.rotation); // Apply rotation

            ctx.fillStyle = "black";
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height); // Draw centered

            ctx.restore(); // Restore the context to avoid affecting other objects
        }

        // Detecta si una bala toca al enemigo
        checkCollision(bullet) {
            return bullet.x < this.x + this.width &&
                bullet.x + bullet.width > this.x &&
                bullet.y < this.y + this.height &&
                bullet.y + bullet.height > this.y;
        }

        shoot() {
            // Shoot 3 bullets spread out toward the player
            let angleToPlayer = Math.atan2(player.y - this.y, player.x - this.x);
            let spread = 0.2; // Spread angle

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
            this.angle = angle; // Angle of the bullet
        }

        update() {
            // Move bullet based on angle
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
    }, 1500); // -- Cada 1.5 segundos

    function runGame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // -- Dibujar y actualizar jugador
        player.update();
        player.draw();

        // -- Dibujar y actualizar balas
        bullets.forEach((bullet, index) => {
            bullet.update();
            bullet.draw();

            // -- Eliminar balas que salen de la pantalla
            if (bullet.y < 0) {
                bullets.splice(index, 1);
            }
        });

        // -- Dibujar y actualizar enemigos
        enemies.forEach((enemy, enemyIndex) => {
            enemy.update();
            enemy.draw();

            // -- Revisar si una bala ha tocado un enemigo
            bullets.forEach((bullet, bulletIndex) => {
                if (enemy.checkCollision(bullet)) {
                    // -- Eliminar enemigo y bala
                    enemies.splice(enemyIndex, 1);
                    bullets.splice(bulletIndex, 1);
                    score++; // -- Aumentar el contador de enemigos eliminados
                }
            });
        });

        // -- Dibujar y actualizar balas de los enemigos
        enemyBullets.forEach((bullet, index) => {
            bullet.update();
            bullet.draw();

            // -- Eliminar balas que salen de la pantalla
            if (bullet.y > canvas.height || bullet.y < 0 || bullet.x < 0 || bullet.x > canvas.width) {
                enemyBullets.splice(index, 1);
            }

            // -- Revisar si una bala enemiga toca al jugador
            if (bullet.x < player.x + player.width &&
                bullet.x + bullet.width > player.x &&
                bullet.y < player.y + player.height &&
                bullet.y + bullet.height > player.y) {
                player.lives--; // Reduce player lives
                enemyBullets.splice(index, 1); // Remove the bullet
            }
        });

        // -- Dibujar el contador de enemigos eliminados
        ctx.font = "20px Arial";
        ctx.fillStyle = "black";
        ctx.fillText("Score: " + score, canvas.width - 100, 30);

        // -- Mostrar vidas restantes
        ctx.fillText("Lives: " + player.lives, 10, 30);

        if (!gameOver) {
            requestAnimationFrame(runGame);
        }
    }

    // Event Listeners para teclas de movimiento
    window.addEventListener("keydown", function(event) {
        keys[event.key] = true;
    });

    window.addEventListener("keyup", function(event) {
        keys[event.key] = false;
    });

    requestAnimationFrame(runGame); // Iniciar el juego
};
