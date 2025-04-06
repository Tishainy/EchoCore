console.log("Bullets module loaded");

export class Bullet {
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
        super(x, y, angle); // Inherit from EnemyBullet
        this.bounces = 0;
        this.maxBounces = 1; // Bounce once
        this.creationTime = Date.now();
        this.lifetime = 7000; // 7 seconds
    }

    update() {
        // Calculate velocity
        const vx = this.speed * Math.cos(this.angle);
        const vy = this.speed * Math.sin(this.angle);

        // Update position
        this.x += vx;
        this.y += vy;

        // Bounce off canvas edges if bounces remain
        if (this.bounces < this.maxBounces) {
            if (this.x <= 0 || this.x + this.width >= 500) { // Canvas width = 500
                this.angle = Math.PI - this.angle; // Reflect horizontally
                this.bounces++;
            }
            if (this.y <= 0 || this.y + this.height >= 500) { // Canvas height = 500
                this.angle = -this.angle; // Reflect vertically
                this.bounces++;
            }
        }

        // Normalize angle
        if (this.angle < 0) this.angle += 2 * Math.PI;
        if (this.angle >= 2 * Math.PI) this.angle -= 2 * Math.PI;
    }

    draw(ctx) {
        ctx.fillStyle = "purple"; // Distinct color for boss bullets
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    hasExpired() {
        return Date.now() - this.creationTime > this.lifetime; // True after 7 seconds
    }
}