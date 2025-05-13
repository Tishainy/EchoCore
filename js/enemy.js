import { EnemyBullet, BossBullet } from './bullets.js'; // Import BossBullet // Importar BossBullet

console.log("Enemy module loaded"); // Enemy module loaded // Módulo de enemigo cargado

export class Enemy {
    constructor() {
        this.x = Math.random() * (500 - 40); // Posición horizontal aleatoria
        this.y = -40; // Comienza encima del lienzo
        this.width = 30; // Ancho del enemigo
        this.height = 30; // Altura del enemigo
        this.baseSpeed = 1 + Math.random(); // Velocidad aleatoria entre 1 y 2
        this.speed = this.baseSpeed; // Velocidad inicial
        this.rotation = 0; // Ángulo de rotación inicial
        this.shootCooldown = 0; // Enfriamiento inicial para disparar
        this.exploding = false; // Bandera para el estado de explosión
        this.explosionSize = 0; // Tamaño inicial de la explosión
        this.opacity = 1; // Opacidad inicial para desvanecerse durante la explosión
        this.hasPlayedSound = false; // Bandera para controlar si el sonido ya se ha reproducido
    }

    update(player, enemyBullets, canvas, isSlowMotion) {
        this.speed = this.baseSpeed; // Velocidad normal
    
        if (this.exploding) {
            this.explosionSize += 3;
            this.opacity -= 0.01;
        
            if (!this.hasPlayedDeathSound) {
                const bossDeadSound = new Audio('./music/enemyDead.mp3');
                bossDeadSound.volume = 0.9;
                bossDeadSound.play().catch(() => {
                    console.log("De browser heeft het automatisch afspelen geblokkeerd. Interactie is vereist.");
                });
                this.hasPlayedDeathSound = true;
            }
        
            return this.opacity <= 0;
        }
    
        this.y += this.speed; // Mover al enemigo hacia abajo
        this.rotation += 0.05; // Rotar al enemigo para animación
        
        if (this.rotation >= 2 * Math.PI) this.rotation = 0; // Reiniciar la rotación después de un círculo completo
    
        if (this.shootCooldown <= 0) {
            this.shoot(player, enemyBullets); // Disparar si el tiempo de recarga ha terminado
            this.shootCooldown = 1000; // Restablecer el tiempo de recarga
        } else {
            this.shootCooldown -= 15; // Reducir el tiempo de recarga con el tiempo
        }
    
        return this.y > canvas.height; // Retornar verdadero si el enemigo está fuera de la pantalla
    }

    draw(ctx) {
        ctx.save();
        if (this.exploding) {
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2); // Move to the center of the enemy // Mover al centro del enemigo
            ctx.rotate(this.rotation); // Rotate according to the rotation angle // Rotar según el ángulo de rotación
            ctx.strokeStyle = `rgba(128, 128, 128, ${this.opacity})`; // Explosion color and opacity // Color y opacidad de la explosión
            ctx.lineWidth = 5;
            ctx.strokeRect(
                -this.width / 2 - this.explosionSize / 2, // Draw explosion border // Dibujar el borde de la explosión
                -this.height / 2 - this.explosionSize / 2,
                this.width + this.explosionSize,
                this.height + this.explosionSize
            );
        } else {
            let gradient = ctx.createLinearGradient(0, 0, this.width, this.height); // Gradient effect for enemy color // Efecto de gradiente para el color del enemigo
            gradient.addColorStop(1, "white"); // Add color stop to gradient // Agregar un punto de color al gradiente
            gradient.addColorStop(0, "gray"); // Add color stop to gradient // Agregar un punto de color al gradiente
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2); // Move to the center of the enemy // Mover al centro del enemigo
            ctx.rotate(this.rotation); // Rotate enemy for animation // Rotar al enemigo para la animación
            ctx.fillStyle = gradient; // Set fill style to gradient // Establecer el estilo de relleno al gradiente
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height); // Draw enemy // Dibujar al enemigo
        }
        ctx.restore();
    }

    checkCollision(bullet) {
        return (
            bullet.x < this.x + this.width && // Check if bullet is within enemy's boundaries // Verificar si la bala está dentro de los límites del enemigo
            bullet.x + bullet.width > this.x &&
            bullet.y < this.y + this.height &&
            bullet.y + bullet.height > this.y
        );
    }

    shoot(player, enemyBullets) {
        let angleToPlayer = Math.atan2(player.y - this.y, player.x - this.x); // Calcular el ángulo hacia el jugador // Calculate angle to player
        let spread = 0.4; // Aumentar la dispersión de las balas // Increase bullet spread
        let bulletCount = 8; // Aumentar la cantidad de balas disparadas // Increase the number of bullets fired
    
        for (let i = -Math.floor(bulletCount / 2); i <= Math.floor(bulletCount / 2); i++) {
            const bullet = new EnemyBullet(
                this.x + this.width / 2 - 2, // Posicionar la bala cerca del centro del enemigo // Position bullet near the center of the enemy
                this.y + this.height,
                angleToPlayer + i * spread // Aplicar dispersión al ángulo de la bala // Apply spread to the bullet's angle
            );
            enemyBullets.push(bullet); // Agregar la bala al array de balas del enemigo // Add bullet to the array of enemy bullets
        }
    }
}

export class Boss {
    constructor() {
        this.x = 225; // Set initial position for the boss // Establecer la posición inicial del jefe
        this.y = 50;
        this.width = 50;
        this.height = 50;
        this.health = 10000; // Set boss's health // Establecer la salud del jefe
        this.speed = 2.5; // Set boss's speed // Establecer la velocidad del jefe
        this.rotation = 0;
        this.shootCooldown = 0;
        this.patternPhase = 0; // Phase of attack pattern // Fase del patrón de ataque
        this.exploding = false; // Flag for explosion state // Bandera para el estado de explosión
        this.explosionSize = 0;
        this.opacity = 1;
    }

    update(player, enemyBullets, canvas, isSlowMotion) {
        if (this.exploding) {
            this.explosionSize += 3; // Increase explosion size // Aumentar el tamaño de la explosión
            this.opacity -= 0.01; // Decrease opacity over time // Disminuir la opacidad con el tiempo
            return this.opacity <= 0; // Return true if explosion is finished // Devolver verdadero si la explosión ha terminado
        }

        this.x += this.speed; // Move the boss horizontally // Mover al jefe horizontalmente
        if (this.x <= 50 || this.x + this.width >= canvas.width - 50) {
            this.speed = -this.speed; // Reverse direction if boss hits screen edges // Invertir dirección si el jefe toca los bordes de la pantalla
        }

        this.rotation += 0.02; // Rotate boss for animation // Rotar al jefe para la animación

        if (this.shootCooldown <= 0) {
            this.shootPatterns(enemyBullets); // Shoot according to patterns // Disparar según los patrones
            this.shootCooldown = 1000; // Reset cooldown // Restablecer el tiempo de recarga
            this.patternPhase = (this.patternPhase + 1) % 3; // Change pattern phase // Cambiar la fase del patrón
        } else {
            this.shootCooldown -= 45; // Reduce cooldown over time // Reducir el tiempo de recarga con el tiempo
        }

        return false; // Boss is not out of the screen // El jefe no está fuera de la pantalla
    }

    draw(ctx) {
        ctx.save();
        if (this.exploding) {
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2); // Move to the center of the boss // Mover al centro del jefe
            ctx.rotate(this.rotation); // Rotate according to the rotation angle // Rotar según el ángulo de rotación
            ctx.strokeStyle = `rgba(128, 128, 128, ${this.opacity})`; // Explosion color and opacity // Color y opacidad de la explosión
            ctx.lineWidth = 5;
            ctx.strokeRect(
                -this.width / 2 - this.explosionSize / 2, // Draw explosion border // Dibujar el borde de la explosión
                -this.height / 2 - this.explosionSize / 2,
                this.width + this.explosionSize,
                this.height + this.explosionSize
            );
        } else {
            let gradient = ctx.createLinearGradient(0, 0, this.width, this.height); // Gradient effect for boss color // Efecto de gradiente para el color del jefe
            gradient.addColorStop(0, "gray"); // Add color stop to gradient // Agregar un punto de color al gradiente
            gradient.addColorStop(1, "white"); // Add color stop to gradient // Agregar un punto de color al gradiente
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2); // Move to the center of the boss // Mover al centro del jefe
            ctx.rotate(this.rotation); // Rotate boss for animation // Rotar al jefe para la animación
            ctx.fillStyle = gradient; // Set fill style to gradient // Establecer el estilo de relleno al gradiente
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height); // Draw boss // Dibujar al jefe
        }
        ctx.restore();
    }

    checkCollision(bullet) {

        if (this.exploding) {
            return false; // Return false immediately if enemy is exploding
        }
        
        const hit = (
            bullet.x < this.x + this.width && // Verificar si la bala está dentro de los límites del jefe
            bullet.x + bullet.width > this.x &&
            bullet.y < this.y + this.height &&
            bullet.y + bullet.height > this.y
        );
        
        if (hit && !this.exploding) {
            this.health -= 10; // Reducir la salud del jefe
            
            // Reproducir el sonido de golpe del jefe (solo al recibir un golpe)
            const bossHitSound = new Audio('./music/bossHit.mp3');
            bossHitSound.volume = 0.1; // Ajusta el volumen si es necesario
            bossHitSound.play().catch(() => {
                console.log("De browser heeft het automatisch afspelen geblokkeerd. Interactie is vereist.");
            });
        
            if (this.health <= 0 && !this.exploding) {
                this.exploding = true; // Activar la explosión si la salud llega a 0
            }
        }
        return hit;
    }

    shootPatterns(enemyBullets) {
        const centerX = this.x + this.width / 2; // Center of the boss
        const centerY = this.y + this.height / 2;

        if (this.patternPhase === 0) {
            // Pattern 0: Spiral Wave
            const bulletCount = 7;
            const spiralSpeed = 0.1; // Rotation speed of the spiral
            for (let i = 0; i < bulletCount; i++) {
                const angle = (i / bulletCount) * 2 * Math.PI + this.rotation * spiralSpeed;
                const bullet = new BossBullet(centerX, centerY, angle);
                bullet.speed = 2; // Slightly slower for dodgeability
                enemyBullets.push(bullet);
            }
        } else if (this.patternPhase === 1) {
            // Pattern 1: Double Arc Burst
            const arcCount = 2;
            const bulletCountPerArc = 4;
            const arcSpread = 0.5; // Spread of each arc
            for (let arc = 0; arc < arcCount; arc++) {
                const baseAngle = Math.PI * (arc === 0 ? 0.75 : 1.25); // Two arcs at slight angles downward
                for (let i = 0; i < bulletCountPerArc; i++) {
                    const angle = baseAngle + (i - bulletCountPerArc / 2) * arcSpread / bulletCountPerArc;
                    const bullet = new BossBullet(centerX, centerY, angle);
                    bullet.speed = 2.5; // Moderate speed
                    enemyBullets.push(bullet);
                }
            }
        } else if (this.patternPhase === 2) {
            // Pattern 2: Flower Petal Pattern
            const petalCount = 4;
            const bulletCountPerPetal = 3;
            const petalSpread = 0.2;
            for (let petal = 0; petal < petalCount; petal++) {
                const baseAngle = (petal / petalCount) * 2 * Math.PI;
                for (let i = 0; i < bulletCountPerPetal; i++) {
                    const angle = baseAngle + (i - bulletCountPerPetal / 2) * petalSpread;
                    const bullet = new BossBullet(centerX, centerY, angle);
                    bullet.speed = 2; // Slower speed for a "petal" effect
                    enemyBullets.push(bullet);
                }
            }
        }
    }
}