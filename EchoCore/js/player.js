import { Bullet } from './bullets.js';

console.log("Player module loaded");

export class Player {
    constructor() {
        this.x = 240;
        this.y = 240;
        this.width = 20;
        this.height = 20;
        this.lives = 3;
        this.speed = 2;
        this.rotation = 0;
        this.isJPressed = false;
        this.damageLevel = 1;
        this.columns = 1;
    }

    update(keys, shootCooldown, bullets, canvas, speedUpgrade = 0) {
        let prevWidth = this.width;
        let prevHeight = this.height;

        if (keys["j"]) {
            this.isJPressed = true;
            this.speed = 2;
            this.width = 10;
            this.height = 10;
        } else {
            this.isJPressed = false;
            this.speed = 4;
            this.width = 20;
            this.height = 20;
        }

        // Ajustar posición para mantener el centro
        if (this.width !== prevWidth) {
            this.x += (prevWidth - this.width) / 2;
        }
        if (this.height !== prevHeight) {
            this.y += (prevHeight - this.height) / 2;
        }

        if (keys["w"] || keys["ArrowUp"]) this.y -= this.speed;
        if (keys["s"] || keys["ArrowDown"]) this.y += this.speed;
        if (keys["a"] || keys["ArrowLeft"]) this.x -= this.speed;
        if (keys["d"] || keys["ArrowRight"]) this.x += this.speed;

        this.x = Math.max(0, Math.min(canvas.width - this.width, this.x));
        this.y = Math.max(0, Math.min(canvas.height - this.height, this.y));

        this.rotation += 0.05;
        if (this.rotation >= 2 * Math.PI) this.rotation = 0;

        const baseCooldown = 200 - speedUpgrade * 50;
        if (shootCooldown <= 0) {
            this.shoot(bullets);
            return baseCooldown;
        }

        return shootCooldown - 8 - speedUpgrade * 2;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation);
        ctx.strokeStyle = "white";
        ctx.lineWidth = 3;
        ctx.shadowColor = "rgba(255, 255, 255, 0.38";
        ctx.shadowOffsetX = 10;
        ctx.shadowOffsetY = 10;
        ctx.shadowBlur = 10;
        ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
        ctx.restore();
    }

    shoot(bullets) {
        const bulletSpacing = 10;
        const totalWidth = (this.columns - 1) * bulletSpacing;
        const startX = this.x + (this.width / 2) - (totalWidth / 2);

        for (let i = 0; i < this.columns; i++) {
            const bullet = new Bullet(startX + i * bulletSpacing, this.y);
            bullet.damage = this.damageLevel * 10;
            bullets.push(bullet);
        }
    }
}