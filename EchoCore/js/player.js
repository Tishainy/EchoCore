import { Bullet } from './bullets.js';

console.log("Player module loaded");

export class Player {
    constructor() {
        // Posición inicial del jugador / Initial player position
        this.x = 240;
        this.y = 240;

        // Tamaño del jugador / Player size
        this.width = 20;
        this.height = 20;

        // Vidas del jugador / Player lives
        this.lives = 3;

        // Velocidad de movimiento / Movement speed
        this.speed = 2;

        // Rotación para efecto visual / Rotation for visual effect
        this.rotation = 0;

        // Si "j" está presionada / If "j" is pressed
        this.isJPressed = false;

        // Nivel de daño / Damage level
        this.damageLevel = 1;
    }

    update(keys, shootCooldown, bullets, canvas) {
        // Verifica si "j" está presionada para modo precisión / Check if "j" is pressed for precision mode
        if (keys["j"]) {
            this.isJPressed = true;
            this.speed = 2;         // Velocidad reducida / Reduced speed
            this.width = 10;        // Tamaño reducido / Smaller size
            this.height = 10;
        } else {
            this.isJPressed = false;
            this.speed = 4;         // Velocidad normal / Normal speed
            this.width = 20;        // Tamaño normal / Normal size
            this.height = 20;
        }

        // Movimiento con WASD o flechas / Movement with WASD or arrow keys
        if (keys["w"] || keys["ArrowUp"]) this.y -= this.speed;
        if (keys["s"] || keys["ArrowDown"]) this.y += this.speed;
        if (keys["a"] || keys["ArrowLeft"]) this.x -= this.speed;
        if (keys["d"] || keys["ArrowRight"]) this.x += this.speed;

        // Limitar al jugador dentro del canvas / Keep player inside canvas
        this.x = Math.max(0, Math.min(canvas.width - this.width, this.x));
        this.y = Math.max(0, Math.min(canvas.height - this.height, this.y));

        // Rotación del jugador / Player rotation
        this.rotation += 0.05;
        if (this.rotation >= 2 * Math.PI) this.rotation = 0;

        // Disparo / Shooting
        if (shootCooldown <= 0) {
            this.shoot(bullets);  // Disparar / Fire a bullet
            return 200;           // Reiniciar cooldown / Reset cooldown
        }

        return shootCooldown - 8; // Reducir cooldown / Decrease cooldown
    }

    draw(ctx) {
        ctx.save();

        // Centrar y rotar el jugador / Center and rotate player
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation);

        // Dibujar con estilo / Draw with shadow and stroke
        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;
        ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
        ctx.shadowOffsetX = 10;
        ctx.shadowOffsetY = 10;
        ctx.shadowBlur = 10;
        ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);

        ctx.restore();
    }

    shoot(bullets) {
        // Crear bala en el centro del jugador / Create bullet at center of player
        const bullet = new Bullet(this.x + this.width / 2 - 2, this.y);
        bullets.push(bullet);
    }
}