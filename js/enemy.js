import { EnemyBullet } from './bullets.js';

console.log("Enemy module loaded");

export class Enemy {
    constructor() {
        this.x = Math.random() * (500 - 40);
        this.y = -40;
        this.width = 30;
        this.height = 30;
        this.speed = 1 + Math.random();
        this.rotation = 0;
        this.shootCooldown = 0;
        this.exploding = false;
        this.explosionSize = 0;
        this.opacity = 1;
    }

    update(player, enemyBullets, canvas, isSlowMotion) {
        if (isSlowMotion) {
            this.speed *= 0.5; // Reducir la velocidad de los enemigos en modo lento
        }

        if (this.exploding) {
            this.explosionSize += 2;
            this.opacity -= 0.02;
            return this.opacity <= 0; // Return true if fully exploded
        }

        this.y += this.speed;
        this.rotation += 0.05;
        if (this.rotation >= 2 * Math.PI) this.rotation = 0;

        if (this.shootCooldown <= 0) {
            this.shoot(player, enemyBullets);
            this.shootCooldown = 1000; // Reset cooldown
        } else {
            this.shootCooldown -= 10; // Decrease cooldown
        }

        return this.y > canvas.height; // Return true if off-screen
    }

    draw(ctx) {
        ctx.save();
        if (this.exploding) {
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
            ctx.rotate(this.rotation);
            ctx.strokeStyle = `rgba(128, 128, 128, ${this.opacity})`;
            ctx.lineWidth = 5;
            ctx.strokeRect(
                -this.width / 2 - this.explosionSize / 2,
                -this.height / 2 - this.explosionSize / 2,
                this.width + this.explosionSize,
                this.height + this.explosionSize
            );
        } else {
            let gradient = ctx.createLinearGradient(0, 0, this.width, this.height);
            gradient.addColorStop(1, "white");
            gradient.addColorStop(0, "black");
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
            ctx.rotate(this.rotation);
            ctx.fillStyle = gradient;
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        }
        ctx.restore();
    }

    checkCollision(bullet) {
        return (
            bullet.x < this.x + this.width &&
            bullet.x + bullet.width > this.x &&
            bullet.y < this.y + this.height &&
            bullet.y + bullet.height > this.y
        );
    }

    shoot(player, enemyBullets) {
        let angleToPlayer = Math.atan2(player.y - this.y, player.x - this.x);
        let spread = 0.2;
        for (let i = -1; i <= 1; i++) {
            const bullet = new EnemyBullet(
                this.x + this.width / 2 - 2,
                this.y + this.height,
                angleToPlayer + i * spread
            );
            enemyBullets.push(bullet);
        }
    }
}