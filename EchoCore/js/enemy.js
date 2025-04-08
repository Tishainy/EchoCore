import { EnemyBullet, BossBullet } from './bullets.js'; // Import BossBullet // Importar BossBullet

console.log("Enemy module loaded"); // Enemy module loaded // Módulo de enemigo cargado

export class Enemy {
    constructor() {
        this.x = Math.random() * (500 - 40); // Random horizontal position // Posición horizontal aleatoria
        this.y = -40; // Start above the canvas // Comienza encima del lienzo
        this.width = 30; // Width of the enemy // Ancho del enemigo
        this.height = 30; // Height of the enemy // Altura del enemigo
        this.baseSpeed = 1 + Math.random(); // Random speed between 1 and 2 // Velocidad aleatoria entre 1 y 2
        this.speed = this.baseSpeed; // Initial speed // Velocidad inicial
        this.rotation = 0; // Initial rotation angle // Ángulo de rotación inicial
        this.shootCooldown = 0; // Initial cooldown for shooting // Enfriamiento inicial para disparar
        this.exploding = false; // Flag for explosion state // Bandera para el estado de explosión
        this.explosionSize = 0; // Initial explosion size // Tamaño inicial de la explosión
        this.opacity = 1; // Initial opacity for fading out during explosion // Opacidad inicial para desvanecerse durante la explosión
    }

    update(player, enemyBullets, canvas, isSlowMotion) {
        if (isSlowMotion) {
            this.speed = this.baseSpeed * 0.5; // Halve speed during slow motion // Reducir la velocidad a la mitad durante la cámara lenta
        } else {
            this.speed = this.baseSpeed; // Normal speed // Velocidad normal
        }

        if (this.exploding) {
            this.explosionSize += 2; // Increase explosion size // Aumentar el tamaño de la explosión
            this.opacity -= 0.02; // Decrease opacity over time // Disminuir la opacidad con el tiempo
            return this.opacity <= 0; // If opacity is 0, return true to indicate death // Si la opacidad es 0, devolver verdadero para indicar muerte
        }

        this.y += this.speed; // Move the enemy down // Mover al enemigo hacia abajo
        this.rotation += 0.05; // Rotate enemy for animation // Rotar al enemigo para animación
        if (this.rotation >= 2 * Math.PI) this.rotation = 0; // Reset rotation after a full circle // Reiniciar la rotación después de un círculo completo

        if (this.shootCooldown <= 0) {
            this.shoot(player, enemyBullets); // Shoot if cooldown is over // Disparar si el tiempo de recarga ha terminado
            this.shootCooldown = 1000; // Reset cooldown // Restablecer tiempo de recarga
        } else {
            this.shootCooldown -= 10; // Reduce cooldown over time // Reducir el tiempo de recarga con el tiempo
        }

        return this.y > canvas.height; // Return true if enemy is out of screen // Devolver verdadero si el enemigo está fuera de la pantalla
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
            gradient.addColorStop(0, "black"); // Add color stop to gradient // Agregar un punto de color al gradiente
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
        let angleToPlayer = Math.atan2(player.y - this.y, player.x - this.x); // Calculate angle to player // Calcular el ángulo hacia el jugador
        let spread = 0.2; // Spread bullets around the angle // Esparcir las balas alrededor del ángulo
        for (let i = -1; i <= 1; i++) {
            const bullet = new EnemyBullet(
                this.x + this.width / 2 - 2, // Position bullet near the center of the enemy // Posicionar la bala cerca del centro del enemigo
                this.y + this.height,
                angleToPlayer + i * spread // Apply spread to the bullet's angle // Aplicar dispersión al ángulo de la bala
            );
            enemyBullets.push(bullet); // Add bullet to the array of enemy bullets // Agregar la bala al array de balas del enemigo
        }
    }
}

export class Boss {
    constructor() {
        this.x = 225; // Set initial position for the boss // Establecer la posición inicial del jefe
        this.y = 50;
        this.width = 50;
        this.height = 50;
        this.health = 500; // Set boss's health // Establecer la salud del jefe
        this.speed = 1; // Set boss's speed // Establecer la velocidad del jefe
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
            this.shootCooldown -= 10; // Reduce cooldown over time // Reducir el tiempo de recarga con el tiempo
        }

        return false; // Boss is not out of the screen // El jefe no está fuera de la pantalla
    }

    draw(ctx) {
        ctx.save();
        if (this.exploding) {
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2); // Move to the center of the boss // Mover al centro del jefe
            ctx.rotate(this.rotation); // Rotate according to the rotation angle // Rotar según el ángulo de rotación
            ctx.strokeStyle = `rgba(255, 0, 0, ${this.opacity})`; // Explosion color and opacity // Color y opacidad de la explosión
            ctx.lineWidth = 5;
            ctx.strokeRect(
                -this.width / 2 - this.explosionSize / 2, // Draw explosion border // Dibujar el borde de la explosión
                -this.height / 2 - this.explosionSize / 2,
                this.width + this.explosionSize,
                this.height + this.explosionSize
            );
        } else {
            let gradient = ctx.createLinearGradient(0, 0, this.width, this.height); // Gradient effect for boss color // Efecto de gradiente para el color del jefe
            gradient.addColorStop(0, "red"); // Add color stop to gradient // Agregar un punto de color al gradiente
            gradient.addColorStop(1, "black"); // Add color stop to gradient // Agregar un punto de color al gradiente
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2); // Move to the center of the boss // Mover al centro del jefe
            ctx.rotate(this.rotation); // Rotate boss for animation // Rotar al jefe para la animación
            ctx.fillStyle = gradient; // Set fill style to gradient // Establecer el estilo de relleno al gradiente
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height); // Draw boss // Dibujar al jefe
        }
        ctx.restore();
    }

    checkCollision(bullet) {
        const hit = (
            bullet.x < this.x + this.width && // Check if bullet is within boss's boundaries // Verificar si la bala está dentro de los límites del jefe
            bullet.x + bullet.width > this.x &&
            bullet.y < this.y + this.height &&
            bullet.y + bullet.height > this.y
        );
        if (hit && !this.exploding) {
            this.health -= 10; // Reduce boss health // Reducir la salud del jefe
            if (this.health <= 0) this.exploding = true; // Trigger explosion if health is 0 // Activar explosión si la salud es 0
        }
        return hit;
    }

    shootPatterns(enemyBullets) {
        const centerX = this.x + this.width / 2; // Center of the boss // Centro del jefe
        const centerY = this.y + this.height / 2;

        if (this.patternPhase === 0) {
            const bulletCount = 12; // Pattern 0: Shoot in a circular spread // Patrón 0: Disparar en una dispersión circular
            for (let i = 0; i < bulletCount; i++) {
                const angle = (i / bulletCount) * 2 * Math.PI; // Calculate the angle for each bullet // Calcular el ángulo para cada bala
                const bullet = new BossBullet(centerX, centerY, angle); // Create a bullet with BossBullet // Crear una bala con BossBullet
                enemyBullets.push(bullet); // Add bullet to enemy bullets array // Agregar la bala al array de balas del enemigo
            }
        } else if (this.patternPhase === 1) {
            const bulletCount = 5; // Pattern 1: Shoot in a spread with fewer bullets // Patrón 1: Disparar en una dispersión con menos balas
            for (let i = 0; i < bulletCount; i++) {
                const angle = Math.PI + (i - bulletCount / 2) * 0.3; // Calculate the angle for each bullet // Calcular el ángulo para cada bala
                const bullet = new BossBullet(centerX, centerY, angle); // Create a bullet with BossBullet // Crear una bala con BossBullet
                enemyBullets.push(bullet); // Add bullet to enemy bullets array // Agregar la bala al array de balas del enemigo
            }
        } else if (this.patternPhase === 2) {
            const bulletCount = 8; // Pattern 2: Shoot a circular spread with more bullets // Patrón 2: Disparar una dispersión circular con más balas
            for (let i = 0; i < bulletCount; i++) {
                const angle = this.rotation + (i / bulletCount) * 2 * Math.PI; // Calculate the angle for each bullet // Calcular el ángulo para cada bala
                const bullet = new BossBullet(centerX, centerY, angle); // Create a bullet with BossBullet // Crear una bala con BossBullet
                enemyBullets.push(bullet); // Add bullet to enemy bullets array // Agregar la bala al array de balas del enemigo
            }
        }
    }
}