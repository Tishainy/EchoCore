console.log("Bullets module loaded");

export class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 5;
        this.height = 10;
        this.speed = 5;
        this.damage = 10;

        // Reproducir el sonido al disparar
        this.playShootSound();
    }

    playShootSound() {
        const shootSound = new Audio('./music/shoot.mp3'); // Asegúrate de que el archivo de sonido esté en la ruta correcta
        shootSound.volume = 0.1; // Ajusta el volumen como desees
        shootSound.play().catch(() => {
            console.log("El navegador bloqueó el autoplay. Necesita interacción.");
        });
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
        this.maxBounces = 3; // Still allows multiple bounces
        this.creationTime = Date.now();
        this.lifetime = 7000; // Full lifetime as fallback
        this.fadeStartTime = null; // Time when fade *starts* (after delay)
        this.firstBounceTime = null; // Time of first bounce
        this.delayBeforeFade = 1800; // 1.8 seconds delay before fading starts
        this.fadeDuration = 100; // 0.1 seconds to fade out
        this.opacity = 1; // Start fully opaque
    }

    update() {
        const vx = this.speed * Math.cos(this.angle);
        const vy = this.speed * Math.sin(this.angle);
        this.x += vx;
        this.y += vy;

        // Bounce logic: Reflect off canvas edges if bounces < maxBounces
        if (this.bounces < this.maxBounces) {
            let bounced = false;

            // Horizontal bounce (left or right edge)
            if (this.x <= 0) {
                this.x = 0;
                this.angle = Math.PI - this.angle;
                this.bounces++;
                if (this.bounces === 1) this.firstBounceTime = Date.now(); // Record first bounce time
                bounced = true;
            } else if (this.x + this.width >= 500) {
                this.x = 500 - this.width;
                this.angle = Math.PI - this.angle;
                this.bounces++;
                if (this.bounces === 1) this.firstBounceTime = Date.now(); // Record first bounce time
                bounced = true;
            }

            // Vertical bounce (top or bottom edge)
            if (this.y <= 0) {
                this.y = 0;
                this.angle = -this.angle;
                if (!bounced) {
                    this.bounces++;
                    if (this.bounces === 1) this.firstBounceTime = Date.now(); // Record first bounce time
                }
            } else if (this.y + this.height >= 500) {
                this.y = 500 - this.height;
                this.angle = -this.angle;
                if (!bounced) {
                    this.bounces++;
                    if (this.bounces === 1) this.firstBounceTime = Date.now(); // Record first bounce time
                }
            }
        }

        // Fade logic: Start fading after 1.8 seconds from first bounce
        if (this.firstBounceTime && !this.fadeStartTime) {
            const timeSinceFirstBounce = Date.now() - this.firstBounceTime;
            if (timeSinceFirstBounce >= this.delayBeforeFade) {
                this.fadeStartTime = Date.now(); // Start fading after 1.8 seconds
            }
        }

        if (this.fadeStartTime) {
            const timeSinceFade = Date.now() - this.fadeStartTime;
            this.opacity = Math.max(0, 1 - timeSinceFade / this.fadeDuration); // Fade from 1 to 0 over 0.1s
        }

        // Normalize angle to stay within 0 to 2π
        if (this.angle < 0) this.angle += 2 * Math.PI;
        if (this.angle >= 2 * Math.PI) this.angle -= 2 * Math.PI;
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = `rgba(0, 0, 255, ${this.opacity})`; // Blue with opacity
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.restore();
    }

    hasExpired() {
        return Date.now() - this.creationTime > this.lifetime || this.opacity <= 0; // Expire if lifetime exceeded or fully faded
    }
}
