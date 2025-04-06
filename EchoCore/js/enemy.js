import { EnemyBullet, BossBullet } from './bullets.js'; // Import BossBullet

console.log("Enemy module loaded");

export class Enemy {
    constructor() {
        this.x = Math.random() * (500 - 40);
        this.y = -40;
        this.width = 30;
        this.height = 30;
        this.baseSpeed = 1 + Math.random();
        this.speed = this.baseSpeed;
        this.rotation = 0;
        this.shootCooldown = 0;
        this.exploding = false;
        this.explosionSize = 0;
        this.opacity = 1;
    }

    update(player, enemyBullets, canvas, isSlowMotion) {
        if (isSlowMotion) {
            this.speed = this.baseSpeed * 0.5;
        } else {
            this.speed = this.baseSpeed;
        }

        if (this.exploding) {
            this.explosionSize += 2;
            this.opacity -= 0.02;
            return this.opacity <= 0;
        }

        this.y += this.speed;
        this.rotation += 0.05;
        if (this.rotation >= 2 * Math.PI) this.rotation = 0;

        if (this.shootCooldown <= 0) {
            this.shoot(player, enemyBullets);
            this.shootCooldown = 1000;
        } else {
            this.shootCooldown -= 10;
        }

        return this.y > canvas.height;
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

export class Boss {
    constructor() {
        this.x = 225;
        this.y = 50;
        this.width = 50;
        this.height = 50;
        this.health = 500;
        this.speed = 1;
        this.rotation = 0;
        this.shootCooldown = 0;
        this.patternPhase = 0;
        this.exploding = false;
        this.explosionSize = 0;
        this.opacity = 1;
    }

    update(player, enemyBullets, canvas, isSlowMotion) {
        if (this.exploding) {
            this.explosionSize += 3;
            this.opacity -= 0.01;
            return this.opacity <= 0;
        }

        this.x += this.speed;
        if (this.x <= 50 || this.x + this.width >= canvas.width - 50) {
            this.speed = -this.speed;
        }

        this.rotation += 0.02;

        if (this.shootCooldown <= 0) {
            this.shootPatterns(enemyBullets);
            this.shootCooldown = 1000;
            this.patternPhase = (this.patternPhase + 1) % 3;
        } else {
            this.shootCooldown -= 10;
        }

        return false;
    }

    draw(ctx) {
        ctx.save();
        if (this.exploding) {
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
            ctx.rotate(this.rotation);
            ctx.strokeStyle = `rgba(255, 0, 0, ${this.opacity})`;
            ctx.lineWidth = 5;
            ctx.strokeRect(
                -this.width / 2 - this.explosionSize / 2,
                -this.height / 2 - this.explosionSize / 2,
                this.width + this.explosionSize,
                this.height + this.explosionSize
            );
        } else {
            let gradient = ctx.createLinearGradient(0, 0, this.width, this.height);
            gradient.addColorStop(0, "red");
            gradient.addColorStop(1, "black");
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
            ctx.rotate(this.rotation);
            ctx.fillStyle = gradient;
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        }
        ctx.restore();
    }

    checkCollision(bullet) {
        const hit = (
            bullet.x < this.x + this.width &&
            bullet.x + bullet.width > this.x &&
            bullet.y < this.y + this.height &&
            bullet.y + bullet.height > this.y
        );
        if (hit && !this.exploding) {
            this.health -= 10;
            if (this.health <= 0) this.exploding = true;
        }
        return hit;
    }

    shootPatterns(enemyBullets) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;

        if (this.patternPhase === 0) {
            const bulletCount = 12;
            for (let i = 0; i < bulletCount; i++) {
                const angle = (i / bulletCount) * 2 * Math.PI;
                const bullet = new BossBullet(centerX, centerY, angle); // Use BossBullet
                enemyBullets.push(bullet);
            }
        } else if (this.patternPhase === 1) {
            const bulletCount = 5;
            for (let i = 0; i < bulletCount; i++) {
                const angle = Math.PI + (i - bulletCount / 2) * 0.3;
                const bullet = new BossBullet(centerX, centerY, angle); // Use BossBullet
                enemyBullets.push(bullet);
            }
        } else if (this.patternPhase === 2) {
            const bulletCount = 8;
            for (let i = 0; i < bulletCount; i++) {
                const angle = this.rotation + (i / bulletCount) * 2 * Math.PI;
                const bullet = new BossBullet(centerX, centerY, angle); // Use BossBullet
                enemyBullets.push(bullet);
            }
        }
    }
}