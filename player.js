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