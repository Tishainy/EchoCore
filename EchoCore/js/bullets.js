console.log("Bullets module loaded");

export class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 5;
        this.height = 10;
        this.speed = 5;
        this.damage = 10;
    }

    update() {
        this.y -= this.speed;
    }

    draw(ctx) {
        ctx.fillStyle = "red";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

export class EnemyBullet {
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

    draw(ctx) {
        ctx.fillStyle = "blue";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

export class BossBullet extends EnemyBullet {
    constructor(x, y, angle) {
        super(x, y, angle);
        this.bounces = 0;
        this.maxBounces = 1;
        this.creationTime = Date.now();
        this.lifetime = 7000;
    }

    update() {
        const vx = this.speed * Math.cos(this.angle);
        const vy = this.speed * Math.sin(this.angle);
        this.x += vx;
        this.y += vy;

        if (this.bounces < this.maxBounces) {
            if (this.x <= 0 || this.x + this.width >= 500) {
                this.angle = Math.PI - this.angle;
                this.bounces++;
            }
            if (this.y <= 0 || this.y + this.height >= 500) {
                this.angle = -this.angle;
                this.bounces++;
            }
        }

        if (this.angle < 0) this.angle += 2 * Math.PI;
        if (this.angle >= 2 * Math.PI) this.angle -= 2 * Math.PI;
    }

    draw(ctx) {
        ctx.fillStyle = "purple";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    hasExpired() {
        return Date.now() - this.creationTime > this.lifetime;
    }
}